from typing import List, Optional
from pydantic import BaseModel, Field


class ChunkInfo(BaseModel):
    chunkId: str
    text: str
    tokenCount: int
    embeddingDimension: int = 1536


class IngestRequest(BaseModel):
    documentId: Optional[str] = None
    title: str
    category: str = "General"
    content: str
    chunkSize: Optional[int] = 250
    overlap: Optional[int] = 40


class IngestResponse(BaseModel):
    success: bool = True
    chunksCount: int
    chunksSample: List[ChunkInfo] = Field(default_factory=list)
    message: Optional[str] = "Document ingested and embedded successfully"


class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5
    category: Optional[str] = None


class SearchResultItem(BaseModel):
    documentId: str
    title: str
    category: str
    similarityScore: float
    snippet: str
    vectorModel: str = "text-embedding-3-large"


class SearchResponse(BaseModel):
    success: bool = True
    query: str
    results: List[SearchResultItem] = Field(default_factory=list)
