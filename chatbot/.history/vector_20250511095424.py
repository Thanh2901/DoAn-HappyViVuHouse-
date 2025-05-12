from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import pandas as pd


df = pd.read.read_csv("data/cleaned_data.csv")
embeddings = OllamaEmbeddings(model="mxbai-embed-large")