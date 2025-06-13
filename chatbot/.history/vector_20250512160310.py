from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import pandas as pd

# Đọc file output.csv, bỏ cột 'id'
df = pd.read_csv("output.csv")
df = df.drop(columns=["id"])

embeddings = OllamaEmbeddings(model="mxbai-embed-large")

db_location = "./chrone_lanagchain_db"
add_documents = not os.path.exists(db_location)

if add_documents:
    documents = []
    ids = []
    for i, row in df.iterrows():
        # Gộp tất cả các trường thành 1 chuỗi, phân cách bởi dấu xuống dòng
        page_content = "\n".join([f"{col}: {row[col]}" for col in df.columns])
        document = Document(
            page_content=page_content,
            metadata={},  # Có thể thêm metadata nếu muốn
            id=str(i)
        )
        ids.append(str(i))
        documents.append(document)

vector_store = Chroma(
    collection_name="restaurant_reviews",
    persist_directory=db_location,
    embedding_function=embeddings,
)

if add_documents:
    vector_store.add_documents(documents, ids=ids)
    
retriever = vector_store.as_retriever(
    search_kwargs={"k": 2}
)

