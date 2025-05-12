from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

model = OllamaLLM(model="llama3.2", temperature=0.7)

template = """
You are an expert in answering question about a pizza restaurant.

Here are some relevant reviews: {reviews}

Here is the question: {question}
"""

prompts = ChatPromptTemplate.from_template(template)
chain = prompts | model

while True:
    print("\n\n-------------------------------------------")
    question = input("Ask your question: (q to quit): ")
    print("\n\n")
    if question == "q":
        break
    
    
result = chain.invoke({"reviews": [], "question": "What is the best pizza?"})
print(result)
