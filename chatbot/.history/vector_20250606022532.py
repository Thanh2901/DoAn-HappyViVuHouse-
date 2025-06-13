from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import pandas as pd
import numpy as np
from tqdm import tqdm
import pickle
import time
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cấu hình để tối ưu vector database
BATCH_SIZE = 32  # Xử lý theo batch để tăng hiệu suất
CACHE_DIR = "./embedding_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Khởi tạo embeddings với caching để tăng tốc
class CachedEmbeddings:
    def __init__(self, model_name="mxbai-embed-large"):
        self.embeddings = OllamaEmbeddings(
            model=model_name,
            model_kwargs={"num_thread": 4},  # Tăng số luồng xử lý
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
                logger.warning(f"Lỗi khi đọc cache: {e}")
                return {}
        return {}
    
    def _save_cache(self):
        with open(self.cache_file, "wb") as f:
            pickle.dump(self.cache, f)
    
    def embed_documents(self, texts):
        result = []
        new_texts = []
        new_indices = []
        
        # Kiểm tra cache trước
        for i, text in enumerate(texts):
            if text in self.cache:
                result.append(self.cache[text])
            else:
                new_texts.append(text)
                new_indices.append(i)
        
        # Nếu có văn bản mới cần nhúng
        if new_texts:
            logger.info(f"Tạo embedding cho {len(new_texts)} văn bản mới")
            # Xử lý theo batch
            all_embeddings = []
            for i in range(0, len(new_texts), BATCH_SIZE):
                batch = new_texts[i:i+BATCH_SIZE]
                batch_embeddings = self.embeddings.embed_documents(batch)
                all_embeddings.extend(batch_embeddings)
                time.sleep(0.1)  # Tránh quá tải Ollama server
            
            # Lưu vào cache
            for i, emb in zip(range(len(new_texts)), all_embeddings):
                self.cache[new_texts[i]] = emb
            
            # Thêm các embeddings mới vào kết quả
            for i, idx in enumerate(new_indices):
                result.insert(idx, all_embeddings[i])
            
            # Lưu cache
            self._save_cache()
        
        return result

def extract_ward(address):
    match = re.search(r"phường ([a-zA-ZÀ-ỹ\s]+)", address, re.IGNORECASE)
    return match.group(1).strip() if match else ""

def extract_district(address):
    match = re.search(r"quận ([a-zA-ZÀ-ỹ\s]+)", address, re.IGNORECASE)
    return match.group(1).strip() if match else ""

def clean_text(text):
    return re.sub(r"[^\w\s]", "", str(text)).lower().strip()

def create_vector_db():
    logger.info("Đang khởi tạo vector database...")
    start_time = time.time()
    
    # Đọc dữ liệu và tiền xử lý
    df = pd.read_csv("output.csv")
    df = df.drop(columns=["id"])
    
    # Thêm các cột ward và district
    df["ward"] = df["address"].apply(lambda x: extract_ward(x) if pd.notna(x) else "")
    df["district"] = df["address"].apply(lambda x: extract_district(x) if pd.notna(x) else "")
    
    # Khởi tạo embeddings với cache
    embedding_function = CachedEmbeddings()
    
    db_location = "./chroma_langchain_db"
    add_documents = not os.path.exists(db_location)
    
    if add_documents:
        documents = []
        ids = []
        texts = []
        
        logger.info("Chuẩn bị dữ liệu cho vector database...")
        for i, row in tqdm(df.iterrows(), total=len(df)):
            # Format dữ liệu
            page_content = (
                f"Title: {row['title']}\n"
                f"Address: {row['address']}\n"
                f"Price: {row['price']} đồng/tháng\n"
                f"Description: {row['description']}\n"
            )
            
            metadata = {
                "title": row["title"],
                "address": row["address"],
                "ward": row["ward"],
                "district": row["district"],
                "price": row["price"],
                "desc": row["description"],
                "latitude": float(row["latitude"]) if not pd.isna(row["latitude"]) else 0,
                "longitude": float(row["longitude"]) if not pd.isna(row["longitude"]) else 0,
                "ward_clean": clean_text(row["ward"]),
                "district_clean": clean_text(row["district"]),
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
        
        # Thêm documents theo batch để tăng hiệu suất
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
    
    # Khởi tạo retriever với tùy chọn tối ưu
    retriever = vector_store.as_retriever(
        search_type="mmr",  # Maximum Marginal Relevance - cho kết quả đa dạng hơn
        search_kwargs={
            "k": 5,  # Số lượng kết quả
            "fetch_k": 10,  # Truy vấn nhiều hơn rồi lọc để tăng độ chính xác
            "lambda_mult": 0.7,  # Cân bằng giữa liên quan và đa dạng
        }
    )
    
    logger.info(f"Hoàn thành trong {time.time() - start_time:.2f} giây")
    return retriever

if __name__ == "__main__":
    retriever = create_vector_db()
    logger.info("Vector database đã sẵn sàng để sử dụng")