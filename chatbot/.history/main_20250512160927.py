from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

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

Dưới đây là các thông tin phòng trọ liên quan: {reviews}

Câu hỏi của khách hàng: {question}
"""

prompts = ChatPromptTemplate.from_template(template)
chain = prompts | model

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(req: QuestionRequest):
    reviews = retriever.invoke(req.question)
    if isinstance(reviews, list):
        reviews_text = "\n".join([getattr(r, "page_content", str(r)) for r in reviews])
    else:
        reviews_text = str(reviews)
    result = chain.invoke({"reviews": reviews_text, "question": req.question})
    return {"answer": result}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)
