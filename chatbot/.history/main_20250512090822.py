from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import uvicorn

app = FastAPI()

model = OllamaLLM(model="llama3.2", temperature=0.7)

template = """
You are an expert in answering question about a pizza restaurant.

Here are some relevant reviews: {reviews}

Here is the question: {question}
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
