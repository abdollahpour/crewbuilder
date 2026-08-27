CREATE TABLE IF NOT EXISTS agents (
    name TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    role TEXT NOT NULL,
    goal TEXT NOT NULL,
    backstory TEXT NOT NULL,
    tools JSONB NOT NULL DEFAULT '[]',
    mcps JSONB NOT NULL DEFAULT '[]',
    skills JSONB NOT NULL DEFAULT '[]',
    knowledge JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
