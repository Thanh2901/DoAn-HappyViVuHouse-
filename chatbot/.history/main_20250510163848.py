from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import PromptTemplate

model = OllamaLLM(model="llama3.2", temperature=0.7)

template = """
You are an expert in answering question about a pizza restaurant.

Here are some relevant reviews: {reviews}

Here is the question: {question}
"""

prompts = ChatPromptTemplate(template)
