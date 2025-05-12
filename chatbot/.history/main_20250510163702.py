from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import PromptTemplate

model = OllamaLLM(model="llama3.2", temperature=0.7)

template = """
You are a helpful assistant that translates English to French."""

