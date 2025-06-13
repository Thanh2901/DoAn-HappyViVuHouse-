from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re
from unidecode import unidecode
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc chỉ định domain frontend, ví dụ: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = OllamaLLM(model="llama3.2", temperature=0.3)

template = """
Bạn là chuyên gia tư vấn về phòng cho thuê tại Hà Nội.

Dưới đây là các thông tin phòng trọ liên quan (mỗi phòng là một mục, gồm địa chỉ, giá, mô tả, trạng thái,...): 
{reviews}

Dựa vào thông tin trên, hãy trả lời câu hỏi của khách hàng một cách chi tiết, trích xuất dữ liệu cụ thể từ danh sách phòng trọ nếu có.
Nếu không tìm thấy phòng phù hợp, hãy trả lời lịch sự rằng chưa có dữ liệu phù hợp.

Câu hỏi của khách hàng: {question}
"""

prompts = ChatPromptTemplate.from_template(template)
chain = prompts | model

class QuestionRequest(BaseModel):
    question: str

def filter_by_district(reviews, district_name):
    filtered = []
    for doc in reviews:
        content = getattr(doc, "page_content", str(doc))
        # Kiểm tra district_name có trong address (không phân biệt hoa thường)
        if f"quận {district_name.lower()}" in content.lower():
            filtered.append(doc)
    return filtered

def extract_location(text, keyword):
    """Trích xuất địa điểm từ text dựa trên từ khóa, cải thiện khả năng nhận dạng"""
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
            location = re.split(r"[,.]", location)[0]
            location = location.strip()
            location = re.sub(r"[^\w\s]", "", location)
            return location
    # Tìm kiếm linh hoạt hơn nếu không tìm thấy với các pattern chính xác
    words = text.split()
    for i, word in enumerate(words):
        if keyword.lower() in word.lower() and i+1 < len(words):
            return words[i+1]
    return None

def guess_district_or_ward(text, all_rooms):
    """Cải thiện hàm đoán quận hoặc phường từ text"""
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
    typo_corrections = {"ỏe": "ở", "o": "ở"}
    for typo, correction in typo_corrections.items():
        text = text.replace(typo, correction)
    # Ưu tiên nhận diện Nghĩa Đô
    target_keywords = ["nghĩa đô", "nghia do", "nghiado"]
    for keyword in target_keywords:
        if keyword in text:
            for ward in wards:
                if "nghĩa đô" in ward or "nghia do" in ward:
                    return "Nghĩa Đô", None
    for ward in wards:
        if ward in text:
            return ward, None
    for district in districts:
        if district in text:
            return None, district
    return None, None

async def process_query(question: str):
    """Hàm xử lý không đồng bộ chính - được cải thiện"""
    question_lower = question.lower()
    all_rooms = get_all_rooms()

    # Kiểm tra trực tiếp nếu tìm kiếm liên quan đến Nghĩa Đô
    if "nghĩa đô" in question_lower or "nghia do" in question_lower or "ỏe phường nghĩa đô" in question_lower:
        filtered_rooms = all_rooms[all_rooms["address_clean"].str.contains("nghĩa đô", na=False)]
        if not filtered_rooms.empty:
            reviews_text = ""
            for _, row in filtered_rooms.head(5).iterrows():
                reviews_text += f"- Tên: {row['title']}\n  Địa chỉ: {row['address']}\n  Giá: {row['price']} đ/tháng\n  Mô tả: {row['description']}\n\n"
            result = await asyncio.to_thread(
                chain.invoke,
                {"reviews": reviews_text, "question": question}
            )
            return result

    district = extract_location(question_lower, "quận")
    ward = extract_location(question_lower, "phường")

    # Tìm phòng xung quanh
    m = re.search(r"phòng\s*(\d+)", question_lower)
    if ("xung quanh" in question_lower or "gần" in question_lower or "lân cận" in question_lower) and m:
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
                reviews_text += f"- {row['title']}: {row['address']} (cách {row['distance']:.2f} km)\n  Giá: {row['price']} đ/tháng\n  Mô tả: {row['description']}\n\n"
            return reviews_text
        else:
            return f"Không tìm thấy thông tin về {room_title} trong hệ thống."

    # Nếu không tìm thấy trực tiếp, thử đoán
    if not district and not ward:
        ward, district = guess_district_or_ward(question_lower, all_rooms)

    filtered_rooms = all_rooms

    # Lọc theo ward hoặc district 
    if ward:
        ward_clean = clean_text(ward)
        mask = filtered_rooms["address_clean"].str.contains(ward_clean, na=False)
        filtered_rooms = filtered_rooms[mask]
    elif district:
        district_clean = clean_text(district)
        mask = filtered_rooms["address_clean"].str.contains(district_clean, na=False)
        filtered_rooms = filtered_rooms[mask]

    # Xử lý kết quả
    if filtered_rooms.empty:
        reviews_text = ""
    else:
        filtered_rooms = filtered_rooms.head(5)
        reviews_text = ""
        for _, row in filtered_rooms.iterrows():
            reviews_text += f"- Tên: {row['title']}\n  Địa chỉ: {row['address']}\n  Giá: {row['price']} đ/tháng\n  Mô tả: {row['description']}\n\n"

    result = await asyncio.to_thread(
        chain.invoke,
        {"reviews": reviews_text, "question": question}
    )
    return result

all_rooms = pd.read_csv("output.csv").drop(columns=["id"])

print(all_rooms[all_rooms["address"].str.lower().str.contains("quận cầu giấy", na=False)])

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
        # Không dùng timeout nữa, gọi trực tiếp
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
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)
