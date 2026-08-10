import json

import faiss
import numpy as np
from fastembed import TextEmbedding
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.agent_deps import resolve_agent_effective_deps
from app.registry import fetch_agent, fetch_knowledge
from app.schemas import Knowledge, Crew

EMBED_MODEL = "BAAI/bge-small-en-v1.5"
TEXT_SPLITTER = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)


def build_faiss_index(
    knowledge: Knowledge,
    output_prefix: str,
) -> dict[str, bytes]:
    """Build one knowledge directory: source .md plus FAISS index."""
    files: dict[str, bytes] = {
        f"{output_prefix}/{knowledge.name}.md": knowledge.content.encode("utf-8"),
    }

    content = knowledge.content.strip()
    if not content:
        return files

    documents: list[str] = []
    metadatas: list[dict] = []
    ids: list[str] = []
    for chunk_idx, chunk in enumerate(TEXT_SPLITTER.split_text(content)):
        documents.append(chunk)
        metadatas.append({"source": knowledge.name, "chunk": chunk_idx})
        ids.append(f"{knowledge.name}:{chunk_idx}")

    model = TextEmbedding(model_name=EMBED_MODEL)
    vectors = np.asarray(list(model.passage_embed(documents)), dtype=np.float32)

    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)
    files[f"{output_prefix}/docs.index"] = faiss.serialize_index(index).tobytes()
    files[f"{output_prefix}/metadata.json"] = json.dumps(
        {"documents": documents, "metadatas": metadatas, "ids": ids},
        indent=2,
    ).encode("utf-8")

    return files


def collect_knowledge_files(crew: Crew) -> dict[str, bytes]:
    """Package each unique knowledge once under knowledge/<name>/."""
    names: list[str] = []
    seen: set[str] = set()

    for agent_name in crew.agents:
        agent = fetch_agent(agent_name)
        _, _, knowledge_names = resolve_agent_effective_deps(agent)
        for entry_name in knowledge_names:
            if entry_name in seen:
                continue
            seen.add(entry_name)
            names.append(entry_name)

    files: dict[str, bytes] = {}
    for entry_name in names:
        knowledge = fetch_knowledge(entry_name)
        files.update(build_faiss_index(knowledge, f"knowledge/{knowledge.name}"))
    return files
