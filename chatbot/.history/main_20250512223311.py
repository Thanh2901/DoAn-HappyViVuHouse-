from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re

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

Dưới đây là danh sách các phòng trọ phù hợp (mỗi phòng gồm: tên phòng, địa chỉ, giá, mô tả, trạng thái,...):
{reviews}

Hãy trả lời câu hỏi của khách hàng dựa trên danh sách trên. Nếu không có phòng nào phù hợp, hãy trả lời lịch sự rằng chưa có dữ liệu phù hợp.

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

all_rooms = pd.read_csv("output.csv").drop(columns=["id"])

print(all_rooms[all_rooms["address"].str.lower().str.contains("quận cầu giấy", na=False)])

@app.post("/ask")
async def ask_question(req: QuestionRequest):
    question_lower = req.question.lower()
    district = extract_location(question_lower, "quận")
    ward = extract_location(question_lower, "phường")

    print("DEBUG - ward:", ward)
    print("DEBUG - district:", district)

    filtered_rooms = all_rooms
    if ward:
        filtered_rooms = filtered_rooms[
            filtered_rooms["address"].str.lower().str.contains(f"phường {ward.strip().lower()}", na=False)
        ]
    elif district:
        filtered_rooms = filtered_rooms[
            filtered_rooms["address"].str.lower().str.contains(f"quận {district.strip().lower()}", na=False)
        ]

    if filtered_rooms.empty:
        reviews_text = ""
    else:
        filtered_rooms = filtered_rooms.head(3)
        reviews_text = ""
        for idx, row in filtered_rooms.iterrows():
            reviews_text += f"Phòng: {row['title']}\n"
            reviews_text += f"Địa chỉ: {row['address']}\n"
            reviews_text += f"Giá: {row['price']} đồng/tháng\n"
            reviews_text += "\n"

    print("DEBUG - reviews_text:\n", reviews_text)
    result = chain.invoke({"reviews": reviews_text, "question": req.question})
    return {"answer": result}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)
