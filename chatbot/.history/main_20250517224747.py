from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re
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
Bạn là một trợ lý thân thiện, trả lời tự nhiên và dễ hiểu.

Nếu câu hỏi là xã giao (ví dụ: bạn có khỏe không, chào bạn, tạm biệt, bạn tên gì, bạn là ai...), trả lời ngắn gọn, thân thiện, không nhắc đến phòng trọ.
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

class QuestionRequest(BaseModel):
    question: str

def clean_text(text):
    """Chuẩn hóa văn bản, xử lý tiếng Việt"""
    if not isinstance(text, str):
        return ""
    text = str(text).lower().strip()
    text = re.sub(r"\s+", " ", text)  # Chuẩn hóa khoảng trắng
    text = re.sub(r"[^\w\s]", "", text)  # Loại bỏ ký tự đặc biệt
    return text

def clean_status(text):
    """Chuẩn hóa trạng thái"""
    if not isinstance(text, str):
        return ""
    return text.strip().upper()

@lru_cache(maxsize=100)
def get_all_rooms():
    """Cache dữ liệu phòng"""
    df = pd.read_csv("output.csv").drop(columns=["id"], errors="ignore")
    # Chuẩn hóa dữ liệu
    df["title_clean"] = df["title"].apply(clean_text)
    df["address_clean"] = df["address"].apply(clean_text)
    df["address_no_accent"] = df["address"].apply(lambda x: unidecode(str(x).lower().strip()))
    df["address"] = df["address"].apply(lambda x: re.sub(r"\s+", " ", str(x).strip()))
    df["status"] = df["status"].apply(clean_status)
    print("Dữ liệu phòng sau khi chuẩn hóa:")
    print(df[["title", "address", "status"]])
    return df

def extract_location(text):
    """Trích xuất phường/quận với pattern linh hoạt"""
    text = text.lower().strip()
    
    # Pattern cho phường
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
    
    # Pattern cho quận
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

def find_matching_locations(question, all_rooms):
    """Tìm địa điểm với xử lý phường phổ biến"""
    question_lower = question.lower().strip()
    question_no_accent = unidecode(question_lower)
    
    location_info = extract_location(question_lower)
    ward_name = location_info["ward"]
    district_name = location_info["district"]
    
    # Tìm kiếm phường phổ biến
    common_wards = {
        "thượng đình": ["thượng đình", "thuong dinh", "thuongdinh"],
        "trung liệt": ["trung liệt", "trung liet", "trungliet"],
        "khương trung": ["khương trung", "khuong trung", "khuongtrung"],
        "thanh xuân": ["thanh xuân", "thanh xuan", "thanhxuan"],
        "láng thượng": ["láng thượng", "lang thuong", "langthuong"],
        "kim liên": ["kim liên", "kim lien", "kimlien"],
    }
    
    for ward, variations in common_wards.items():
        if any(variation in question_no_accent or variation in question_lower for variation in variations):
            ward_name = ward
            break
    
    print(f"Trích xuất địa điểm: ward={ward_name}, district={district_name}")
    return {"ward": ward_name, "district": district_name}

async def process_query(question: str):
    """Xử lý câu hỏi với logic tìm kiếm cải tiến"""
    question_lower = question.lower().strip()
    question_no_accent = unidecode(question_lower)
    all_rooms = get_all_rooms()
    
    # Debug: In tất cả phòng liên quan đến Thượng Đình
    print("Các phòng có địa chỉ chứa 'Thượng Đình':")
    print(all_rooms[all_rooms["address"].str.lower().str.contains("thượng đình|thuong dinh", na=False, case=False)][["title", "address", "status"]])
    
    # Lọc phòng khả dụng
    filtered_rooms = all_rooms[all_rooms["status"] == "ROOM_RENT"]
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
        ward_clean = clean_text(ward_name)
        masks = [
            filtered_rooms["address"].str.lower().str.contains(f"phường {ward_name}", na=False, case=False),
            filtered_rooms["address"].str.lower().str.contains(f"p. {ward_name}", na=False, case=False),
            filtered_rooms["address"].str.lower().str.contains(f"p.{ward_name}", na=False, case=False),
            filtered_rooms["address_no_accent"].str.contains(f"phuong {ward_no_accent}", na=False),
            filtered_rooms["address_no_accent"].str.contains(f"p. {ward_no_accent}", na=False),
            filtered_rooms["address_clean"].str.contains(ward_clean, na=False),
            filtered_rooms["address"].str.lower().str.contains(ward_name.replace(" ", ""), na=False, case=False),
            filtered_rooms["address_no_accent"].str.contains(ward_no_accent.replace(" ", ""), na=False),
        ]
        combined_mask = masks[0]
        for i, mask in enumerate(masks[1:], 1):
            combined_mask |= mask
            print(f"Mask {i} trả về {len(filtered_rooms[mask])} phòng")
        ward_rooms = filtered_rooms[combined_mask]
        result_rooms = ward_rooms
        print(f"Số phòng tìm được theo phường '{ward_name}': {len(ward_rooms)}")
        if not ward_rooms.empty:
            print("Các phòng tìm được theo phường:")
            print(ward_rooms[["title", "address", "status"]])
    
    # Tìm theo quận (nếu không tìm thấy phường)
    if district_name and result_rooms.empty:
        district_no_accent = unidecode(district_name.lower())
        masks = [
            filtered_rooms["address"].str.lower().str.contains(f"quận {district_name}", na=False, case=False),
            filtered_rooms["address"].str.lower().str.contains(f"q. {district_name}", na=False, case=False),
            filtered_rooms["address"].str.lower().str.contains(f"q.{district_name}", na=False, case=False),
            filtered_rooms["address_no_accent"].str.contains(f"quan {district_no_accent}", na=False),
            filtered_rooms["address_no_accent"].str.contains(f"q. {district_no_accent}", na=False),
            filtered_rooms["address"].str.lower().str.contains(district_name.replace(" ", ""), na=False, case=False),
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