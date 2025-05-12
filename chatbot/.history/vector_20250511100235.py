from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import pandas as pd
from vector import retriever


df = pd.read.read_csv("data/cleaned_data.csv")
embeddings = OllamaEmbeddings(model="mxbai-embed-large")

db_location = "./chrone_lanagchain_db"
add_documents = not os.path.exists(db_location)

if add_documents:
    documents = []
    ids = []
    for i, row in df.iterrows():
        document = Document(
            page_content = row["Title"] + " " + row["Content"],
            metadata = {"rating": row["Rating"], "date": row["Date"]}
            id=str(i)
         )
        ids.append(str(i))
        documents.append(document)
 
vector_store = Chroma(
    coolection_name="restaurants",
    persist_directory=db_location,
    embedding_function=embeddings,
)

if add_documents:
    vector_store.add_documents(documents, ids=ids)
    vector_store.persist()
    
    
retriever = vector_store.as_retriever(
    search_kwargs={"k": 5}
)

