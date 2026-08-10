import json
from functools import lru_cache
from pathlib import Path

import faiss
import numpy as np
from fastembed import TextEmbedding

EMBED_MODEL = "BAAI/bge-small-en-v1.5"
KNOWLEDGE_ROOT = Path("knowledge")


def _safe_name(name: str) -> str:
    cleaned = name.strip()
    if not cleaned or cleaned in {".", ".."} or "/" in cleaned or "\\" in cleaned:
        raise ValueError(f"Invalid knowledge base name: {name!r}")
    return cleaned


@lru_cache(maxsize=32)
def _load_index(index_dir: str) -> tuple[faiss.IndexFlatIP, dict]:
    base = Path(index_dir)
    index_path = base / "docs.index"
    metadata_path = base / "metadata.json"
    if not index_path.is_file() or not metadata_path.is_file():
        raise FileNotFoundError(f"Knowledge index not found under {base}")

    index = faiss.deserialize_index(np.frombuffer(index_path.read_bytes(), dtype=np.uint8))
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    return index, metadata


@lru_cache(maxsize=1)
def _embedding_model() -> TextEmbedding:
    return TextEmbedding(model_name=EMBED_MODEL)


@lru_cache(maxsize=256)
def _embed_query(query: str) -> tuple[float, ...]:
    vectors = list(_embedding_model().query_embed(query.strip()))
    return tuple(float(x) for x in np.asarray(vectors[0], dtype=np.float32).tolist())


def search_knowledge(knowledge: str, query: str, top_k: int = 5) -> str:
    name = _safe_name(knowledge)
    index_dir = (KNOWLEDGE_ROOT / name).resolve()
    try:
        index, metadata = _load_index(str(index_dir))
    except FileNotFoundError:
        available = sorted(
            p.name
            for p in KNOWLEDGE_ROOT.iterdir()
            if p.is_dir() and (p / "docs.index").is_file()
        ) if KNOWLEDGE_ROOT.is_dir() else []
        hint = f" Available: {', '.join(available)}" if available else ""
        return f"Knowledge base {name!r} not found.{hint}"

    documents: list[str] = metadata["documents"]
    metadatas: list[dict] = metadata["metadatas"]
    if not documents:
        return f"No documents are indexed in knowledge base {name!r}."

    query_vector = np.asarray([_embed_query(query)], dtype=np.float32)
    scores, indices = index.search(query_vector, min(top_k, len(documents)))

    sections: list[str] = []
    for rank, (idx, score) in enumerate(zip(indices[0], scores[0], strict=False), start=1):
        if idx < 0:
            continue
        source = metadatas[idx].get("source", name)
        sections.append(
            "\n".join(
                [
                    f"### Result {rank} (score={score:.3f}, source={source})",
                    documents[idx].strip(),
                ]
            )
        )

    if not sections:
        return "No relevant knowledge passages were found."

    return "\n\n".join(sections)
