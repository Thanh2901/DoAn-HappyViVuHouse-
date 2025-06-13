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

# Template cải tiến
template = """
Bạn là một trợ lý thân thiện, trả lời tự nhiên, dễ hiểu và gần gũi.

Nếu câu hỏi là xã giao (ví dụ: bạn có khỏe không, chào bạn, tạm biệt, bạn tên gì, bạn là ai...), trả lời ngắn gọn, thân thiện như một người thật, không nhắc đến phòng trọ.
Nếu câu hỏi liên quan đến phòng trọ (chứa từ như "phòng", "trọ", "thuê", "phường", "quận", "tìm"), trả lời dựa trên danh sách phòng dưới đây.

DANH SÁCH PHÒNG TRỌ:
{reviews}

Câu hỏi: {question}

QUY TẮC:
- Nếu không có phòng phù hợp, trả lời: "Hiện tại mình chưa tìm thấy phòng nào phù hợp với yêu cầu của bạn, bạn thử thay đổi tiêu chí nhé!"
- KHÔNG đề xuất phòng khác ngoài danh sách.
- KHÔNG bịa ra phòng.
- Nếu có phòng phù hợp, liệt kê đầy đủ tên, địa chỉ, giá và mô tả.
"""

prompts = ChatPromptTemplate.from_template(template)
chain = prompts | model | StrOutputParser()

# Vô hiệu hóa cache tạm thời để debug
response_cache: Dict[str, Any] = {}
CACHE_EXPIRY = 300

class QuestionRequest(BaseModel):
    question: str

def clean_text(text):
    """Chuẩn hóa văn bản, xử lý tiếng Việt"""
    if not isinstance(text, str):
        return ""
    text = str(text).lower().strip()
    text = re.sub(r"\s+", " ", text)  # Chuẩn hóa khoảng trắng
    text = re.sub(r"[^\w\s]", "", text)  # Loại bỏ ký tự đặc biệt
    return unidecode(text)

@lru_cache(maxsize=100)
def get_all_rooms():
    """Cache dữ liệu phòng"""
    df = pd.read_csv("output.csv").drop(columns=["id"])
    df["title_clean"] = df["title"].apply(clean_text)
    df["address_clean"] = df["address"].apply(clean_text)
    df["address_no_accent"] = df["address"].apply(lambda x: unidecode(str(x).lower()))
    df["address"] = df["address"].apply(lambda x: re.sub(r"\s+", " ", str(x).strip()))  # Chuẩn hóa địa chỉ
    return df

def extract_location(text):
    """Trích xuất phường/quận với các pattern cải tiến"""
    text = text.lower().strip()
    
    # Pattern cho phường
    ward_patterns = [
        r"phường\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"p\.?\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"ở\s+(?:phường|p\.?)\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"tại\s+(?:phường|p\.?)\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"thuê\s+.*\s+(?:phường|p\.?)\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"gần\s+(?:phường|p\.?)\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"phường\s*([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)"  # Bắt trường hợp không có khoảng trắng
    ]
    
    for pattern in ward_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            ward = match.group(1).strip()
            return {"ward": ward, "district": None}
    
    # Pattern cho quận
    district_patterns = [
        r"quận\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"q\.?\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"ở\s+(?:quận|q\.?)\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"tại\s+(?:quận|q\.?)\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"thuê\s+.*\s+(?:quận|q\.?)\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"gần\s+(?:quận|q\.?)\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"quận\s*([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)"
    ]
    
    for pattern in district_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            district = match.group(1).strip()
            return {"ward": None, "district": district}
    
    return {"ward": None, "district": None}

def find_matching_locations(question, all_rooms):
    """Tìm địa điểm với xử lý phường phổ biến"""
    question_lower = question.lower().strip()
    question_no_accent = unidecode(question_lower)
    
    location_info = extract_location(question_lower)
    ward_name = location_info["ward"]
    district_name = location_info["district"]
    
    # Debug log
    print(f"Trích xuất địa điểm: ward={ward_name}, district={district_name}")
    
    # Tìm kiếm phường phổ biến trực tiếp
    common_wards = {
        "thượng đình": ["thượng đình", "thuong dinh"],
        "trung liệt": ["trung liệt", "trung liet"],
        "khương trung": ["khương trung", "khuong trung"],
        "thanh xuân": ["thanh xuân", "thanh xuan"],
        "láng thượng": ["láng thượng", "lang thuong"],
        "kim liên": ["kim liên", "kim lien"],
    }
    
    for ward, variations in common_wards.items():
        if any(variation in question_no_accent or variation in question_lower for variation in variations):
            ward_name = ward
            break
    
    return {"ward": ward_name, "district": district_name}

async def process_query(question: str):
    """Xử lý câu hỏi với logic tìm kiếm cải tiến"""
    question_lower = question.lower().strip()
    question_no_accent = unidecode(question_lower)
    all_rooms = get_all_rooms()
    
    # Debug: In tất cả phòng liên quan đến Thượng Đình hoặc các phường khác
    print("Các phòng trong dữ liệu (trước lọc trạng thái):")
    print(all_rooms[["title", "address", "status"]])
    
    # Lọc phòng khả dụng
    filtered_rooms = all_rooms[all_rooms["status"].isin(["ROOM_RENT"])]  # Chỉ lấy ROOM_RENT
    print("Các phòng sau khi lọc trạng thái ROOM_RENT:")
    print(filtered_rooms[["title", "address", "status"]])
    
    # Tìm phòng theo phường/quận
    location_info = find_matching_locations(question_lower, all_rooms)
    ward_name = location_info["ward"]
    district_name = location_info["district"]
    
    print(f"Tìm kiếm: ward={ward_name}, district={district_name}")
    
    result_rooms = pd.DataFrame()
    
    # Tìm theo phường
    if ward_name:
        ward_no_accent = unidecode(ward_name.lower())
        masks = [
            filtered_rooms["address"].str.lower().str.contains(f"phường {ward_name}", na=False, regex=False),
            filtered_rooms["address"].str.lower().str.contains(f"p. {ward_name}", na=False, regex=False),
            filtered_rooms["address"].str.lower().str.contains(f"p.{ward_name}", na=False, regex=False),
            filtered_rooms["address_no_accent"].str.contains(f"phuong {ward_no_accent}", na=False, regex=False),
            filtered_rooms["address_no_accent"].str.contains(f"p. {ward_no_accent}", na=False, regex=False),
            filtered_rooms["address_clean"].str.contains(clean_text(ward_name), na=False),
            filtered_rooms["address"].str.lower().str.contains(ward_name.replace(" ", ""), na=False, regex=False)  # Bắt không khoảng trắng
        ]
        combined_mask = masks[0]
        for mask in masks[1:]:
            combined_mask |= mask
        ward_rooms = filtered_rooms[combined_mask]
        result_rooms = ward_rooms
        print(f"Số phòng tìm được theo phường '{ward_name}': {len(ward_rooms)}")
        if not ward_rooms.empty:
            print("Các phòng tìm được theo phường:")
            print(ward_rooms[["title", "address", "status"]])
    
    # Tìm theo quận
    if district_name and result_rooms.empty:  # Chỉ tìm quận nếu không tìm thấy phường
        district_no_accent = unidecode(district_name.lower())
        masks = [
            filtered_rooms["address"].str.lower().str.contains(f"quận {district_name}", na=False, regex=False),
            filtered_rooms["address"].str.lower().str.contains(f"q. {district_name}", na=False, regex=False),
            filtered_rooms["address"].str.lower().str.contains(f"q.{district_name}", na=False, regex=False),
            filtered_rooms["address_no_accent"].str.contains(f"quan {district_no_accent}", na=False, regex=False),
            filtered_rooms["address_no_accent"].str.contains(f"q. {district_no_accent}", na=False, regex=False),
            filtered_rooms["address"].str.lower().str.contains(district_name.replace(" ", ""), na=False, regex=False)
        ]
        combined_mask = masks[0]
        for mask in masks[1:]:
            combined_mask |= mask
        district_rooms = filtered_rooms[combined_mask]
        result_rooms = district_rooms
        print(f"Số phòng tìm được theo quận '{district_name}': {len(district_rooms)}")
    
    # Xử lý kết quả
    if result_rooms.empty:
        reviews_text = ""
        print("Không tìm thấy phòng phù hợp")
    else:
        result_rooms = result_rooms.head(5)
        reviews_text = ""
        for _, row in result_rooms.iterrows():
            reviews_text += f"- Tên: {row['title']}\n  Địa chỉ: {row['address']}\n  Giá: {row['price']} đ/tháng\n  Mô tả: {row['description']}\n\n"
        print(f"Tìm thấy {len(result_rooms)} phòng phù hợp")
    
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
    else:
        result = await asyncio.to_thread(
            chain.invoke,
            {"reviews": reviews_text, "question": question}
        )
    return result

@app.post("/ask")
async def ask_question(req: QuestionRequest, background_tasks: BackgroundTasks):
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