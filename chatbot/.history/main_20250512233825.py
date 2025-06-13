from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re
import numpy as np

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

Dưới đây là danh sách các phòng trọ phù hợp với yêu cầu của khách hàng (mỗi phòng gồm: tên phòng, địa chỉ, giá, mô tả, trạng thái,...):

{reviews}

Nếu danh sách trên có phòng phù hợp, hãy liệt kê lại thông tin các phòng đó cho khách hàng. Nếu danh sách trống, hãy trả lời lịch sự rằng chưa có dữ liệu phù hợp.

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
    # Lấy cụm từ sau từ khóa cho đến dấu phẩy, chấm hoặc hết câu
    match = re.search(rf"{keyword}\s+([a-zA-ZÀ-ỹ\s]+)", text)
    if match:
        location = match.group(1).strip()
        # Cắt đến dấu phẩy hoặc chấm nếu có
        location = re.split(r"[,.]", location)[0]
        location = location.strip()
        location = re.sub(r"[^\w\s]", "", location)  # Loại bỏ dấu câu thừa
        return location
    return None

def guess_district_or_ward(text, all_rooms):
    # Tìm các quận/phường có trong address của all_rooms
    text = text.lower()
    for addr in all_rooms["address"].dropna():
        addr = addr.lower()
        # Tìm quận
        m = re.search(r"quận ([a-zA-ZÀ-ỹ\s]+)", addr)
        if m:
            district_name = m.group(1).strip()
            if district_name in text:
                return None, district_name
        # Tìm phường
        m = re.search(r"phường ([a-zA-ZÀ-ỹ\s]+)", addr)
        if m:
            ward_name = m.group(1).strip()
            if ward_name in text:
                return ward_name, None
    return None, None

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Bán kính Trái Đất (km)
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    return R * c

all_rooms = pd.read_csv("output.csv").drop(columns=["id"])

print(all_rooms[all_rooms["address"].str.lower().str.contains("quận cầu giấy", na=False)])

@app.post("/ask")
async def ask_question(req: QuestionRequest):
    question_lower = req.question.lower()
    district = extract_location(question_lower, "quận")
    ward = extract_location(question_lower, "phường")

    # Nếu người dùng hỏi về phòng xung quanh một phòng cụ thể
    m = re.search(r"phòng\s*(\d+)", question_lower)
    if "xung quanh" in question_lower and m:
        room_title = f"Phòng {m.group(1)}"
        main_room = all_rooms[all_rooms["title"].str.lower() == room_title.lower()]
        if not main_room.empty:
            lat1, lon1 = float(main_room.iloc[0]["latitude"]), float(main_room.iloc[0]["longitude"])
            others = all_rooms[all_rooms["title"].str.lower() != room_title.lower()].copy()
            others["distance"] = haversine(lat1, lon1, others["latitude"].astype(float), others["longitude"].astype(float))
            nearby = others.nsmallest(3, "distance")
            reviews_text = f"Các phòng trọ gần {room_title}:\n"
            for idx, row in nearby.iterrows():
                reviews_text += f"- {row['title']}: {row['address']} (cách khoảng {row['distance']:.2f} km), Giá: {row['price']} đồng/tháng, Mô tả: {row['description']}\n"
            return {"answer": reviews_text}
        else:
            return {"answer": f"Không tìm thấy thông tin về {room_title} trong hệ thống."}

    if not district and not ward:
        ward, district = guess_district_or_ward(question_lower, all_rooms)

    print("DEBUG - ward:", ward)
    print("DEBUG - district:", district)

    filtered_rooms = all_rooms
    def clean_text(text):
        return re.sub(r"[^\w\s]", "", text).lower().strip()

    if ward:
        ward_clean = clean_text(ward)
        filtered_rooms = filtered_rooms[
            filtered_rooms["address"].apply(lambda x: ward_clean in clean_text(str(x)))
        ]
    elif district:
        district_clean = clean_text(district)
        filtered_rooms = filtered_rooms[
            filtered_rooms["address"].apply(lambda x: district_clean in clean_text(str(x)))
        ]

    print("DEBUG - ward:", ward)
    print("DEBUG - address list:", filtered_rooms["address"].tolist())

    if filtered_rooms.empty:
        reviews_text = ""
    else:
        filtered_rooms = filtered_rooms.head(3)
        reviews_text = ""
        for idx, row in filtered_rooms.iterrows():
            reviews_text += f"Phòng: {row['title']}\n"
            reviews_text += f"Địa chỉ: {row['address']}\n"
            reviews_text += f"Giá: {row['price']} đồng/tháng\n"
            reviews_text += f"Mô tả: {row['description']}\n"
            reviews_text += "\n"

    print("DEBUG - reviews_text:\n", reviews_text)
    result = chain.invoke({"reviews": reviews_text, "question": req.question})
    return {"answer": result}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)
