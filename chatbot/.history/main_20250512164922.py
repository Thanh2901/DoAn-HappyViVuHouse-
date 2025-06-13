from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc chỉ định domain frontend, ví dụ: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = OllamaLLM(model="llama3.2", temperature=0.7)

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

all_rooms = pd.read_csv("output.csv").drop(columns=["id"])

@app.post("/ask")
async def ask_question(req: QuestionRequest):
    question_lower = req.question.lower()
    district = None
    if "quận" in question_lower:
        try:
            district = question_lower.split("quận")[1].split()[0].strip()
        except Exception:
            district = None

    filtered_rooms = all_rooms
    if district:
        filtered_rooms = all_rooms[all_rooms["address"].str.lower().str.contains(f"quận {district}", na=False)]

    if filtered_rooms.empty:
        reviews_text = ""
    else:
        reviews_text = "\n\n".join(
            [
                "\n".join([f"{col}: {row[col]}" for col in all_rooms.columns if col != "id"])
                for _, row in filtered_rooms.iterrows()
            ]
        )

    print("DEBUG - reviews_text:\n", reviews_text)
    result = chain.invoke({"reviews": reviews_text, "question": req.question})
    return {"answer": result}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)
