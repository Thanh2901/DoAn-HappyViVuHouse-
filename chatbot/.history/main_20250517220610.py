from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re
import asyncio
import os
from typing import Dict, Any
from functools import lru_cache
import time
from langchain_core.output_parsers import StrOutputParser
from unidecode import unidecode
import pickle
from tqdm import tqdm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình vector database
BATCH_SIZE = 32
CACHE_DIR = "./embedding_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Khởi tạo LLM
model = OllamaLLM(
    model="llama3.2",
    temperature=0.3,
    num_thread=4,
    base_url="http://ollama:11434",
)

# Template cải tiến
template = """
Bạn là một trợ lý thân thiện, trả lời tự nhiên và dễ hiểu.

Nếu câu hỏi là xã giao (ví dụ: bạn có khỏe không, chào bạn, tạm biệt, bạn tên gì, bạn là ai...), trả lời ngắn gọn, thân thiện, không nhắc đến phòng trọ.
Nếu câu hỏi liên quan đến phòng trọ (chứa từ như "phòng", "trọ", "thuê", "phường", "quận", "tìm"), trả lời dựa trên danh sách phòng dưới đây.

DANH SÁCH PHÒNG TRỌ:
{reviews}

Câu hỏi: {question}

QUY TẮC NGHIÊM NGẶT:
- Nếu không có phòng phù hợp, trả lời CHÍNH XÁC: "Hiện tại mình chưa tìm thấy phòng nào phù hợp với yêu cầu của bạn, bạn thử thay đổi tiêu chí nhé!"
- KHÔNG đề xuất bất kỳ nguồn bên ngoài (ví dụ: trang web, ứng dụng) hoặc phòng không có trong danh sách.
- KHÔNG bịa ra phòng.
- Nếu có phòng phù hợp, liệt kê đầy đủ tên, địa chỉ, giá và mô tả, không thêm thông tin ngoài danh sách.
"""

prompts = ChatPromptTemplate.from_template(template)
chain = prompts | model | StrOutputParser()

class QuestionRequest(BaseModel):
    question: str

# Lớp CachedEmbeddings
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
                print(f"Lỗi khi đọc cache: {e}")
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
            print(f"Tạo embedding cho {len(new_texts)} văn bản mới")
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

def clean_text(text):
    """Chuẩn hóa văn bản, xử lý tiếng Việt"""
    if not isinstance(text, str):
        return ""
    text = str(text).lower().strip()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s]", "", text)
    return text

def clean_status(text):
    """Chuẩn hóa trạng thái"""
    if not isinstance(text, str):
        return ""
    return text.strip().upper()

@lru_cache(maxsize=1)
def create_vector_db():
    print("Đang khởi tạo vector database...")
    start_time = time.time()
    
    df = pd.read_csv("output.csv")
    df = df.drop(columns=["id"], errors="ignore")
    df["status"] = df["status"].apply(clean_status)
    
    embedding_function = CachedEmbeddings()
    
    db_location = "./chroma_langchain_db"
    add_documents = not os.path.exists(db_location)
    
    if add_documents:
        documents = []
        ids = []
        texts = []
        
        print("Chuẩn bị dữ liệu cho vector database...")
        for i, row in tqdm(df.iterrows(), total=len(df)):
            page_content = (
                f"Title: {row['title']}\n"
                f"Address: {row['address']}\n"
                f"Price: {row['price']} đồng/tháng\n"
                f"Description: {row['description']}\n"
                f"Status: {row['status']}\n"
            )
            
            metadata = {
                "title": row["title"],
                "address": row["address"],
                "price": row["price"],
                "description": row["description"],
                "status": row["status"],
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
        
        print("Tạo vector database...")
        vector_store = Chroma(
            collection_name="room_rentals",
            persist_directory=db_location,
            embedding_function=embedding_function,
        )
        
        for i in range(0, len(documents), BATCH_SIZE):
            batch_docs = documents[i:i+BATCH_SIZE]
            batch_ids = ids[i:i+BATCH_SIZE]
            vector_store.add_documents(batch_docs, ids=batch_ids)
            print(f"Đã thêm batch {i//BATCH_SIZE + 1}/{(len(documents)-1)//BATCH_SIZE + 1}")
        
        vector_store.persist()
        print(f"Đã tạo vector database với {len(documents)} documents")
    else:
        vector_store = Chroma(
            collection_name="room_rentals",
            persist_directory=db_location,
            embedding_function=embedding_function,
        )
        print(f"Đã tải vector database có sẵn với {vector_store._collection.count()} documents")
    
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 5,
            "fetch_k": 10,
            "lambda_mult": 0.7,
        }
    )
    
    print(f"Hoàn thành trong {time.time() - start_time:.2f} giây")
    return retriever, vector_store

def extract_location(text):
    """Trích xuất phường/quận từ câu hỏi"""
    text = text.lower().strip()
    
    ward_patterns = [
        r"phường\s*([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s*$)",
        r"p\.?\s*([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s*$)",
        r"ở\s*(?:phường|p\.?)\s*([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s*$)",
        r"tại\s*(?:phường|p\.?)\s*([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s*$)",
        r"thuê\s*.*\s*(?:phường|p\.?)\s*([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s*$)",
        r"gần\s*(?:phường|p\.?)\s*([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s*$)",
    ]
    
    for pattern in ward_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            ward = match.group(1).strip()
            return {"ward": ward, "district": None}
    
    district_patterns = [
        r"quận\s*([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s*$)",
        r"q\.?\s*([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s*$)",
        r"ở\s*(?:quận|q\.?)\s*([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s*$)",
        r"tại\s*(?:quận|q\.?)\s*([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s*$)",
        r"thuê\s*.*\s*(?:quận|q\.?)\s*([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s*$)",
        r"gần\s*(?:quận|q\.?)\s*([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s*$)",
    ]
    
    for pattern in district_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            district = match.group(1).strip()
            return {"ward": None, "district": district}
    
    return {"ward": None, "district": None}

async def process_query(question: str):
    """Xử lý câu hỏi với Chroma DB"""
    question_lower = question.lower().strip()
    question_no_accent = unidecode(question_lower)
    
    # Khởi tạo retriever và vector store
    retriever, vector_store = create_vector_db()
    
    # Debug: Kiểm tra câu hỏi
    print(f"Câu hỏi: {question}")
    
    # Kiểm tra câu hỏi xã giao
    social_keywords = ["khỏe không", "cảm ơn", "chào bạn", "tạm biệt", "tên gì", "bao nhiêu tuổi", "bạn là ai"]
    is_social = any(keyword in question_lower for keyword in social_keywords) and not any(
        keyword in question_lower for keyword in ["phòng", "trọ", "thuê", "phường", "quận", "tìm"]
    )
    
    if is_social:
        result = await asyncio.to_thread(
            chain.invoke,
            {"reviews": "", "question": question}
        )
        return result
    
    # Trích xuất phường/quận từ câu hỏi
    location_info = extract_location(question_lower)
    ward_name = location_info["ward"]
    district_name = location_info["district"]
    print(f"Trích xuất địa điểm: ward={ward_name}, district={district_name}")
    
    # Tìm kiếm phòng bằng vector database
    print("Truy vấn vector database...")
    docs = await asyncio.to_thread(retriever.invoke, question)
    
    # Debug: In các tài liệu tìm được
    print(f"Tìm thấy {len(docs)} tài liệu:")
    for doc in docs:
        print(f"- {doc.metadata['title']}: {doc.metadata['address']} (Status: {doc.metadata['status']})")
    
    # Lọc các phòng theo trạng thái và địa điểm
    filtered_docs = []
    for doc in docs:
        if doc.metadata["status"] != "ROOM_RENT":
            continue
        
        # Kiểm tra địa điểm nếu có yêu cầu phường/quận
        address = doc.metadata["address"].lower()
        address_no_accent = unidecode(address)
        ward_match = True
        district_match = True
        
        if ward_name:
            ward_no_accent = unidecode(ward_name.lower())
            ward_clean = clean_text(ward_name)
            ward_match = (
                f"phường {ward_name}" in address or
                f"p. {ward_name}" in address or
                f"p.{ward_name}" in address or
                f"phuong {ward_no_accent}" in address_no_accent or
                f"p. {ward_no_accent}" in address_no_accent or
                ward_clean in clean_text(address) or
                ward_name.replace(" ", "") in address.replace(" ", "") or
                ward_no_accent.replace(" ", "") in address_no_accent.replace(" ", "")
            )
        
        if district_name:
            district_no_accent = unidecode(district_name.lower())
            district_match = (
                f"quận {district_name}" in address or
                f"q. {district_name}" in address or
                f"q.{district_name}" in address or
                f"quan {district_no_accent}" in address_no_accent or
                f"q. {district_no_accent}" in address_no_accent or
                district_name.replace(" ", "") in address.replace(" ", "")
            )
        
        if ward_match and district_match:
            filtered_docs.append(doc)
    
    print(f"Số phòng sau khi lọc trạng thái ROOM_RENT và địa điểm: {len(filtered_docs)}")
    if filtered_docs:
        print("Các phòng phù hợp:")
        for doc in filtered_docs:
            print(f"- {doc.metadata['title']}: {doc.metadata['address']}")
    
    # Chuẩn bị danh sách phòng để đưa vào template
    if not filtered_docs:
        reviews_text = ""
        print("Không tìm thấy phòng phù hợp")
    else:
        reviews_text = ""
        for doc in filtered_docs:
            reviews_text += (
                f"- Tên: {doc.metadata['title']}\n"
                f"  Địa chỉ: {doc.metadata['address']}\n"
                f"  Giá: {doc.metadata['price']} đ/tháng\n"
                f"  Mô tả: {doc.metadata['description']}\n\n"
            )
        print(f"Đã chuẩn bị {len(filtered_docs)} phòng để trả lời")
    
    # Gọi LLM để tạo phản hồi
    result = await asyncio.to_thread(
        chain.invoke,
        {"reviews": reviews_text, "question": question}
    )
    return result

@app.post("/ask")
async def ask_question(req: QuestionRequest):
    start_time = time.time()
    try:
        result = await process_query(req.question)
        print(f"Query time: {time.time() - start_time:.4f}s")
        return {"answer": result}
    except Exception as e:
        print(f"Error: {e}")
        return {
            "answer": "Xin lỗi, hệ thống gặp lỗi. Vui lòng thử lại sau."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)