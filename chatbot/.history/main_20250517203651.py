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

# Khởi tạo LLM với connection pooling
model = OllamaLLM(
    model="llama3.2", 
    temperature=0.3,
    num_thread=4,  # Sử dụng đa luồng
    base_url="http://ollama:11434",
)

# Tối ưu template với hướng dẫn ngắn gọn và chính xác
template = """
Bạn là một trợ lý thân thiện, hãy trả lời tự nhiên, dễ hiểu và gần gũi cho người hỏi về phòng trọ hoặc các câu hỏi xã giao.

Nếu câu hỏi là xã giao (ví dụ: bạn có khỏe không, cảm ơn, chào bạn, tạm biệt, bạn tên gì, bạn bao nhiêu tuổi, bạn là ai...), hãy trả lời thân thiện, ngắn gọn như một người thật, không cần nhắc đến phòng trọ.
Nếu câu hỏi liên quan đến phòng trọ, hãy trả lời dựa trên danh sách phòng dưới đây.

DANH SÁCH PHÒNG TRỌ:
{reviews}

Câu hỏi: {question}

QUY TẮC QUAN TRỌNG:
- Nếu danh sách phòng trọ trống (không có phòng nào), CHỈ trả lời: "Hiện tại mình chưa tìm thấy phòng nào phù hợp với yêu cầu của bạn, bạn thử thay đổi tiêu chí nhé!"
- KHÔNG đề xuất phòng trọ khác nếu không tìm thấy phòng phù hợp với yêu cầu ban đầu.
- KHÔNG bịa ra phòng không có trong danh sách.
- Nếu có phòng phù hợp, hãy liệt kê đầy đủ tên, địa chỉ, giá và mô tả của từng phòng cho người dùng.
"""

prompts = ChatPromptTemplate.from_template(template)
chain = prompts | model | StrOutputParser()

# Cache để lưu trữ kết quả
response_cache: Dict[str, Any] = {}
CACHE_EXPIRY = 300  # Cache hết hạn sau 5 phút

class QuestionRequest(BaseModel):
    question: str

def clean_text(text):
    """Cải tiến hàm clean_text để xử lý tốt hơn với tiếng Việt có dấu"""
    if not isinstance(text, str):
        return ""
    text = str(text).lower().strip()
    text = unidecode(text)  # Chuyển đổi các ký tự Unicode sang ASCII
    return re.sub(r"[^\w\s]", "", text)

@lru_cache(maxsize=100)
def get_all_rooms():
    """Cache dữ liệu phòng để tránh đọc file nhiều lần"""
    df = pd.read_csv("output.csv").drop(columns=["id"])
    # Tiền xử lý dữ liệu
    df["title_clean"] = df["title"].apply(clean_text)
    df["address_clean"] = df["address"].apply(clean_text)
    # Tạo thêm các trường để dễ tìm kiếm
    df["address_no_accent"] = df["address"].apply(lambda x: unidecode(str(x).lower()))
    return df

# Tính toán khoảng cách với vectorization thay vì áp dụng từng hàng
def calculate_distances(lat1, lon1, latitudes, longitudes):
    R = 6371  # Bán kính Trái Đất (km)
    lat1, lon1 = np.radians([lat1, lon1])
    latitudes, longitudes = np.radians([latitudes, longitudes])
    
    dlat = latitudes - lat1
    dlon = longitudes - lon1
    
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(latitudes) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    
    return R * c

def extract_location(text):
    """Cải tiến hàm trích xuất địa điểm, tập trung vào tên quận và phường"""
    text = text.lower()
    
    # Tìm phường
    ward_patterns = [
        r"phường\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"ở\s+phường\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"tại\s+phường\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)",
        r"thuê\s+.*\s+phường\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận|\s+$)"
    ]
    
    for pattern in ward_patterns:
        match = re.search(pattern, text)
        if match:
            ward = match.group(1).strip()
            return {"ward": ward, "district": None}
    
    # Tìm quận
    district_patterns = [
        r"quận\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"ở\s+quận\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"tại\s+quận\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)",
        r"thuê\s+.*\s+quận\s+([a-zA-ZÀ-ỹ\s0-9]+?)(?:,|\s+$)"
    ]
    
    for pattern in district_patterns:
        match = re.search(pattern, text)
        if match:
            district = match.group(1).strip()
            return {"ward": None, "district": district}
    
    return {"ward": None, "district": None}

def find_matching_locations(question, all_rooms):
    """Tìm tất cả các địa điểm phù hợp từ câu hỏi"""
    # Chuẩn hóa câu hỏi
    question_lower = question.lower()
    question_no_accent = unidecode(question_lower)
    
    # Trích xuất địa điểm từ câu hỏi
    location_info = extract_location(question_lower)
    ward_name = location_info["ward"]
    district_name = location_info["district"]
    
    # Đối với những trường hợp không tìm được qua regex
    if not ward_name and not district_name:
        # Danh sách các phường trong dữ liệu
        all_wards = set()
        ward_pattern = r"phường\s+([a-zA-ZÀ-ỹ\s]+?)(?:,|\s+quận)"
        
        for addr in all_rooms["address"].dropna():
            match = re.search(ward_pattern, str(addr).lower())
            if match:
                all_wards.add(match.group(1).strip())
        
        # Kiểm tra từng phường có trong dữ liệu
        for ward in all_wards:
            if ward.lower() in question_lower or unidecode(ward.lower()) in question_no_accent:
                ward_name = ward
                break
    
    return {"ward": ward_name, "district": district_name}

# Hàm xử lý background để cập nhật cache
async def process_query_background(question: str, cache_key: str):
    try:
        result = await process_query(question)
        response_cache[cache_key] = {
            "result": result,
            "timestamp": time.time()
        }
    except Exception as e:
        print(f"Background task error: {e}")

async def process_query(question: str):
    """Hàm xử lý không đồng bộ chính - cải tiến để tốt hơn"""
    question_lower = question.lower()
    question_no_accent = unidecode(question_lower)
    all_rooms = get_all_rooms()
    
    # Tìm phòng theo phường/quận
    location_info = find_matching_locations(question_lower, all_rooms)
    ward_name = location_info["ward"]
    district_name = location_info["district"]
    
    filtered_rooms = all_rooms
    
    # Lọc theo trạng thái khả dụng
    filtered_rooms = filtered_rooms[filtered_rooms["status"].isin(["ROOM_RENT", "ENABLE"])]
    
    # Debug log
    print(f"Tìm kiếm: ward={ward_name}, district={district_name}")
    
    # Lọc theo phường
    if ward_name:
        ward_no_accent = unidecode(ward_name.lower())
        # Thử tìm theo nhiều cách (có dấu, không dấu)
        mask1 = filtered_rooms["address"].str.lower().str.contains(ward_name, na=False, regex=False)
        mask2 = filtered_rooms["address_no_accent"].str.contains(ward_no_accent, na=False, regex=False)
        filtered_rooms = filtered_rooms[mask1 | mask2]
        
        # Debug
        print(f"Số phòng tìm được theo phường '{ward_name}': {len(filtered_rooms)}")
        
    # Lọc theo quận nếu không tìm thấy phường hoặc không có phường
    elif district_name:
        district_no_accent = unidecode(district_name.lower())
        mask1 = filtered_rooms["address"].str.lower().str.contains(district_name, na=False, regex=False)
        mask2 = filtered_rooms["address_no_accent"].str.contains(district_no_accent, na=False, regex=False)
        filtered_rooms = filtered_rooms[mask1 | mask2]
        
        # Debug
        print(f"Số phòng tìm được theo quận '{district_name}': {len(filtered_rooms)}")
    
    # Trường hợp đặc biệt cho phường Thượng Đình
    if "thượng đình" in question_lower or "thuong dinh" in question_no_accent:
        mask = filtered_rooms["address"].str.lower().str.contains("thượng đình", na=False, regex=False)
        filtered_rooms = all_rooms[mask & all_rooms["status"].isin(["ROOM_RENT", "ENABLE"])]
        print(f"Tìm trực tiếp phường Thượng Đình: {len(filtered_rooms)} kết quả")
    
    # Xử lý kết quả
    if filtered_rooms.empty:
        reviews_text = ""
        print("Không tìm thấy phòng phù hợp")
    else:
        filtered_rooms = filtered_rooms.head(5)
        reviews_text = ""
        for _, row in filtered_rooms.iterrows():
            reviews_text += f"- Tên: {row['title']}\n  Địa chỉ: {row['address']}\n  Giá: {row['price']} đ/tháng\n  Mô tả: {row['description']}\n\n"
        print(f"Tìm thấy {len(filtered_rooms)} phòng phù hợp")
    
    result = await asyncio.to_thread(
        chain.invoke,
        {"reviews": reviews_text, "question": question}
    )
    return result

@app.post("/ask")
async def ask_question(req: QuestionRequest, background_tasks: BackgroundTasks):
    start_time = time.time()
    cache_key = req.question.strip().lower()
    
    # Kiểm tra cache
    cached_response = response_cache.get(cache_key)
    if cached_response and (time.time() - cached_response["timestamp"] < CACHE_EXPIRY):
        print(f"Cache hit! Time: {time.time() - start_time:.4f}s")
        return {"answer": cached_response["result"]}
    
    try:
        # Gọi trực tiếp
        result = await process_query(req.question)
        
        # Lưu vào cache
        response_cache[cache_key] = {
            "result": result,
            "timestamp": time.time()
        }
        
        # Nếu kết quả lấy lâu, chạy background task cho các query tương tự tiếp theo
        if time.time() - start_time > 2.0:
            background_tasks.add_task(process_query_background, req.question, cache_key)
            
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