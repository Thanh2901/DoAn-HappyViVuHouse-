from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import PromptTemplate

model = OllamaLLM(model="llama2", temperature=0.7)

