from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re
import numpy as np
import asyncio
from typing import Dict, Any
from functools import lru_cache
import time
from langchain_core.output_parsers import StrOutputParser
from unidecode import unidecode
from fuzzywuzzy import fuzz
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import pickle
from tqdm import tqdm
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo LLM
model = OllamaLLM(
    model="llama3.2", 
    temperature=0.3,
    num_thread=4,
    base_url="http://ollama:11434",
)

# Template cho LLM
template = """
Bạn là một trợ lý thân thiện, hãy trả lời tự nhiên, dễ hiểu và gần gũi cho người hỏi về phòng trọ hoặc các câu hỏi xã giao.

Nếu câu hỏi là xã giao (ví dụ: bạn có khỏe không, cảm ơn, chào bạn, tạm biệt, bạn tên gì, bạn bao nhiêu tuổi, bạn là ai...), hãy trả lời thân thiện, ngắn gọn như một người thật, không cần nhắc đến phòng trọ.
Nếu câu hỏi liên quan đến phòng trọ, hãy trả lời dựa trên danh sách phòng dưới đây.

DANH SÁCH PHÒNG TRỌ:
{reviews}

Câu hỏi: {question}

Nếu không có phòng phù hợp, hãy trả lời nhẹ nhàng, ví dụ: "Hiện tại mình chưa tìm thấy phòng nào phù hợp với yêu cầu của bạn, bạn thử thay đổi tiêu chí nhé!"
"""

prompts = ChatPromptTemplate.from_template(template)
chain = prompts | model | StrOutputParser()

# Cache
response_cache: Dict[str, Any] = {}
CACHE_EXPIRY = 300  # 5 phút

class QuestionRequest(BaseModel):
    question: str

def clean_text(text):
    return re.sub(r"[^\w\s]", "", str(text)).lower().strip()

@lru_cache(maxsize=100)
def get_all_rooms():
    df = pd.read_csv("output.csv").drop(columns=["id"])
    df["title_clean"] = df["title"].apply(clean_text)
    df["address_clean"] = df["address"].apply(clean_text)
    return df

def calculate_distances(lat1, lon1, latitudes, longitudes):
    R = 6371
    lat1, lon1 = np.radians([lat1, lon1])
    latitudes, longitudes = np.radians([latitudes, longitudes])
    dlat = latitudes - lat1
    dlon = longitudes - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(latitudes) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    return R * c

def extract_location(text, keyword):
    patterns = [
        rf"{keyword}\s+([a-zA-ZÀ-ỹ\s]+)",
        rf"muốn\s+tìm\s+phòng\s+(?:ở|o|ỏe)\s+{keyword}\s+([a-zA-ZÀ-ỹ\s]+)",
        rf"{keyword}\s+([a-zA-ZÀ-ỹ\s]+)(?:\s+có\s+phòng|phòng\s+trọ)",
        rf"(?:ở|o|ỏe)\s+{keyword}\s+([a-zA-ZÀ-ỹ\s]+)"
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            location = match.group(1).strip()
            location = re.split(r"[,.]", location)[0].strip()
            location = re.sub(r"[^\w\s]", "", location)
            return location
    words = text.split()
    for i, word in enumerate(words):
        if keyword.lower() in word.lower() and i+1 < len(words):
            return words[i+1]
    return None

def guess_district_or_ward(text, all_rooms):
    text = text.lower()
    districts = {}
    wards = {}
    for addr in all_rooms["address"].dropna():
        addr = addr.lower()
        m = re.search(r"quận ([a-zA-ZÀ-ỹ\s]+)", addr)
        if m:
            district_name = m.group(1).strip()
            districts[district_name] = True
            districts[unidecode(district_name)] = True
        m = re.search(r"phường ([a-zA-ZÀ-ỹ\s]+)", addr)
        if m:
            ward_name = m.group(1).strip()
            wards[ward_name] = True
            wards[unidecode(ward_name)] = True
    
    typo_corrections = {
        "ỏe": "ở",
        "o": "ở",
        "nghia do": "nghĩa đô",
        "khuong trung": "khương trung"
    }
    for typo, correction in typo_corrections.items():
        text = text.replace(typo, correction)
    
    # Sử dụng fuzzywuzzy để so sánh chuỗi gần giống
    for ward in wards:
        if fuzz.ratio(ward, text) > 80 or ward in text:
            logger.info(f"Đã tìm thấy phường: {ward}")
            return ward, None
    for district in districts:
        if fuzz.ratio(district, text) > 80 or district in text:
            logger.info(f"Đã tìm thấy quận: {district}")
            return None, district
    
    # Kiểm tra đặc biệt cho Nghĩa Đô
    target_keywords = ["nghĩa đô", "nghia do", "nghiado"]
    for keyword in target_keywords:
        if keyword in text:
            for ward in wards:
                if "nghĩa đô" in ward or "nghia do" in ward:
                    logger.info(f"Đã tìm thấy phường Nghĩa Đô qua từ khóa: {keyword}")
                    return "Nghĩa Đô", None
    return None, None

# Khởi tạo vector database
retriever = None
def initialize_retriever():
    global retriever
    if retriever is None:
        retriever = create_vector_db()
    return retriever

# Hàm tạo vector database (giữ nguyên từ mã gốc)
BATCH_SIZE = 32
CACHE_DIR = "./embedding_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

class CachedEmbeddings:
    def __init__(self, model_name="mxbai-embed-large"):
        self.embeddings = OllamaEmbeddings(
            model=model_name,
            model_kwargs={"num_thread": 4},
            base_url="http://ollama:11434",
        )
        self.cache_file = os.path.join(CACHE_DIR, f"{model_name}_cache.pkl")
        self.cache = self._load_cache()
        
    def _load_cache(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "rb") as f:
                    return pickle.load(f)
            except Exception as e:
                logger.error(f"Lỗi khi đọc cache: {e}")
                return {}
        return {}
    
    def _save_cache(self):
        with open(self.cache_file, "wb") as f:
            pickle.dump(self.cache, f)
    
    def embed_documents(self, texts):
        result = []
        new_texts = []
        new_indices = []
        
        for i, text in enumerate(texts):
            if text in self.cache:
                result.append(self.cache[text])
            else:
                new_texts.append(text)
                new_indices.append(i)
        
        if new_texts:
            logger.info(f"Tạo embedding cho {len(new_texts)} văn bản mới")
            all_embeddings = []
            for i in range(0, len(new_texts), BATCH_SIZE):
                batch = new_texts[i:i+BATCH_SIZE]
                batch_embeddings = self.embeddings.embed_documents(batch)
                all_embeddings.extend(batch_embeddings)
                time.sleep(0.1)
            
            for i, emb in zip(range(len(new_texts)), all_embeddings):
                self.cache[new_texts[i]] = emb
            
            for i, idx in enumerate(new_indices):
                result.insert(idx, all_embeddings[i])
            
            self._save_cache()
        
        return result

def create_vector_db():
    logger.info("Đang khởi tạo vector database...")
    start_time = time.time()
    df = pd.read_csv("output.csv")
    df = df.drop(columns=["id"])
    embedding_function = CachedEmbeddings()
    db_location = "./chroma_langchain_db"
    add_documents = not os.path.exists(db_location)
    
    if add_documents:
        documents = []
        ids = []
        texts = []
        logger.info("Chuẩn bị dữ liệu cho vector database...")
        for i, row in tqdm(df.iterrows(), total=len(df)):
            page_content = (
                f"Title: {row['title']}\n"
                f"Address: {row['address']}\n"
                f"Price: {row['price']} đồng/tháng\n"
                f"Description: {row['description']}\n"
            )
            metadata = {
                "title": row["title"],
                "address": row["address"],
                "price": row["price"],
                "desc": row["description"],
                "latitude": float(row["latitude"]) if not pd.isna(row["latitude"]) else 0,
                "longitude": float(row["longitude"]) if not pd.isna(row["longitude"]) else 0,
            }
            document = Document(
                page_content=page_content,
                metadata=metadata,
                id=str(i)
            )
            documents.append(document)
            ids.append(str(i))
            texts.append(page_content)
        
        logger.info("Tạo vector database...")
        vector_store = Chroma(
            collection_name="room_rentals",
            persist_directory=db_location,
            embedding_function=embedding_function,
        )
        
        batch_size = 32
        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i:i+batch_size]
            batch_ids = ids[i:i+batch_size]
            vector_store.add_documents(batch_docs, ids=batch_ids)
            logger.info(f"Đã thêm batch {i//batch_size + 1}/{(len(documents)-1)//batch_size + 1}")
        
        vector_store.persist()
        logger.info(f"Đã tạo vector database với {len(documents)} documents")
    else:
        vector_store = Chroma(
            collection_name="room_rentals",
            persist_directory=db_location,
            embedding_function=embedding_function,
        )
        logger.info(f"Đã tải vector database có sẵn với {vector_store._collection.count()} documents")
    
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 5,
            "fetch_k": 10,
            "lambda_mult": 0.7,
        }
    )
    
    logger.info(f"Hoàn thành trong {time.time() - start_time:.2f} giây")
    return retriever

async def process_query(question: str):
    question_lower = question.lower()
    all_rooms = get_all_rooms()
    initialize_retriever()
    
    # Sử dụng vector database để tìm kiếm trước
    logger.info(f"Tìm kiếm với vector database cho câu hỏi: {question}")
    docs = retriever.invoke(question)
    reviews_text = ""
    if docs:
        logger.info(f"Tìm thấy {len(docs)} kết quả từ vector database")
        for doc in docs:
            reviews_text += (
                f"- Tên: {doc.metadata['title']}\n"
                f"  Địa chỉ: {doc.metadata['address']}\n"
                f"  Giá: {doc.metadata['price']} đ/tháng\n"
                f"  Mô tả: {doc.metadata['desc']}\n\n"
            )
        result = await asyncio.to_thread(
            chain.invoke,
            {"reviews": reviews_text, "question": question}
        )
        return result
    
    # Dự phòng: Xử lý tìm kiếm theo Nghĩa Đô hoặc lọc thủ công
    if "nghĩa đô" in question_lower or "nghia do" in question_lower or "ỏe phường nghĩa đô" in question_lower:
        filtered_rooms = all_rooms[all_rooms["address_clean"].str.contains("nghĩa đô", na=False)]
        if not filtered_rooms.empty:
            reviews_text = ""
            for _, row in filtered_rooms.head(5).iterrows():
                reviews_text += (
                    f"- Tên: {row['title']}\n"
                    f"  Địa chỉ: {row['address']}\n"
                    f"  Giá: {row['price']} đ/tháng\n"
                    f"  Mô tả: {row['description']}\n\n"
                )
            result = await asyncio.to_thread(
                chain.invoke,
                {"reviews": reviews_text, "question": question}
            )
            logger.info("Tìm thấy phòng ở Nghĩa Đô qua lọc thủ công")
            return result
    
    # Tìm phòng xung quanh
    m = re.search(r"phòng\s*(\d+)", question_lower)
    if "xung quanh" in question_lower and m:
        room_title = f"Phòng {m.group(1)}"
        room_title_clean = clean_text(room_title)
        main_room = all_rooms[all_rooms["title_clean"] == room_title_clean]
        if not main_room.empty:
            lat1, lon1 = float(main_room.iloc[0]["latitude"]), float(main_room.iloc[0]["longitude"])
            others = all_rooms[all_rooms["title_clean"] != room_title_clean].copy()
            distances = calculate_distances(
                lat1, lon1,
                others["latitude"].astype(float).values,
                others["longitude"].astype(float).values
            )
            others["distance"] = distances
            nearby = others.nsmallest(3, "distance")
            reviews_text = f"Các phòng trọ gần {room_title}:\n"
            for _, row in nearby.iterrows():
                reviews_text += (
                    f"- {row['title']}: {row['address']} (cách {row['distance']:.2f} km)\n"
                    f"  Giá: {row['price']} đ/tháng\n"
                    f"  Mô tả: {row['description']}\n\n"
                )
            logger.info(f"Tìm thấy phòng gần {room_title}")
            return reviews_text
        else:
            logger.warning(f"Không tìm thấy thông tin về {room_title}")
            return f"Không tìm thấy thông tin về {room_title} trong hệ thống."
    
    # Lọc theo quận/phường nếu vector database không trả kết quả
    district = extract_location(question_lower, "quận")
    ward = extract_location(question_lower, "phường")
    if not district and not ward:
        ward, district = guess_district_or_ward(question_lower, all_rooms)
    
    filtered_rooms = all_rooms
    if ward:
        ward_clean = clean_text(ward)
        mask = filtered_rooms["address_clean"].str.contains(ward_clean, na=False)
        filtered_rooms = filtered_rooms[mask]
        logger.info(f"Lọc theo phường: {ward}")
    elif district:
        district_clean = clean_text(district)
        mask = filtered_rooms["address_clean"].str.contains(district_clean, na=False)
        filtered_rooms = filtered_rooms[mask]
        logger.info(f"Lọc theo quận: {district}")
    
    if filtered_rooms.empty:
        logger.warning(f"Không tìm thấy phòng phù hợp cho câu hỏi: {question}")
        reviews_text = ""
    else:
        filtered_rooms = filtered_rooms.head(5)
        reviews_text = ""
        for _, row in filtered_rooms.iterrows():
            reviews_text += (
                f"- Tên: {row['title']}\n"
                f"  Địa chỉ: {row['address']}\n"
                f"  Giá: {row['price']} đ/tháng\n"
                f"  Mô tả: {row['description']}\n\n"
            )
    
    result = await asyncio.to_thread(
        chain.invoke,
        {"reviews": reviews_text, "question": question}
    )
    return result

@app.post("/ask")
async def ask_question(req: QuestionRequest, background_tasks: BackgroundTasks):
    start_time = time.time()
    cache_key = req.question.strip().lower()
    
    cached_response = response_cache.get(cache_key)
    if cached_response and (time.time() - cached_response["timestamp"] < CACHE_EXPIRY):
        logger.info(f"Cache hit! Time: {time.time() - start_time:.4f}s")
        return {"answer": cached_response["result"]}
    
    try:
        result = await process_query(req.question)
        response_cache[cache_key] = {
            "result": result,
            "timestamp": time.time()
        }
        if time.time() - start_time > 2.0:
            background_tasks.add_task(process_query_background, req.question, cache_key)
        logger.info(f"Query time: {time.time() - start_time:.4f}s")
        return {"answer": result}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {
            "answer": "Xin lỗi, hệ thống gặp lỗi. Vui lòng thử lại sau."
        }

async def process_query_background(question: str, cache_key: str):
    try:
        result = await process_query(question)
        response_cache[cache_key] = {
            "result": result,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Background task error: {e}")

if __name__ == "__main__":
    import uvicorn
    initialize_retriever()
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)