import sys
from pathlib import Path
import pytest

# Ensure ai directory is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.rag.store import rag_store, compute_semantic_vector

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Secret": settings.INTERNAL_SERVICE_SECRET}


def test_semantic_vector_properties():
    vec1 = compute_semantic_vector("mTLS zero-trust communication encryption")
    vec2 = compute_semantic_vector("cryptographic secure network tunnel")
    vec3 = compute_semantic_vector("chocolate chip cookie baking recipe")
    
    # Check dimensions
    assert len(vec1) == 384
    assert len(vec2) == 384
    assert len(vec3) == 384
    
    # Cosine similarity calculation
    def dot_product(v1, v2):
        return sum(a * b for a, b in zip(v1, v2))

    sim_security = dot_product(vec1, vec2)
    sim_unrelated = dot_product(vec1, vec3)

    # Security vectors should have higher semantic affinity than cookies
    assert sim_security > sim_unrelated


def test_preseeded_qdrant_search():
    res = client.post("/rag/search", json={"query": "mTLS zero trust communication"}, headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["results"]) > 0

    top_hit = data["results"][0]
    # Check exact UI contract fields
    assert "documentId" in top_hit
    assert "title" in top_hit
    assert "category" in top_hit
    assert "similarityScore" in top_hit
    assert "snippet" in top_hit
    assert "vectorModel" in top_hit
    assert top_hit["similarityScore"] >= 0.50
    assert "Security" in top_hit["category"] or "Security" in top_hit["title"]


def test_ingest_and_search_roundtrip():
    doc_id = "doc-test-rag-99"
    ingest_payload = {
        "documentId": doc_id,
        "title": "Quantum Key Distribution Architecture.md",
        "category": "Quantum Computing",
        "content": "Quantum key distribution (QKD) utilizes quantum entanglement photons to negotiate symmetric encryption keys immune to Shor's algorithm."
    }
    
    ingest_res = client.post("/rag/ingest", json=ingest_payload, headers=AUTH_HEADERS)
    assert ingest_res.status_code == 200
    ingest_data = ingest_res.json()
    assert ingest_data["success"] is True
    assert ingest_data["chunksCount"] >= 1
    assert len(ingest_data["chunksSample"]) >= 1

    # Search for quantum key distribution
    search_res = client.post("/rag/search", json={"query": "quantum photon entanglement encryption"}, headers=AUTH_HEADERS)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["success"] is True
    
    # Verify the ingested doc is found
    matches = [r for r in search_data["results"] if r["documentId"] == doc_id]
    assert len(matches) > 0
    assert matches[0]["title"] == "Quantum Key Distribution Architecture.md"
    assert matches[0]["similarityScore"] > 0.60
