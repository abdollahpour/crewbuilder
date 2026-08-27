CREATE TABLE IF NOT EXISTS skills (
    name TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    skill_md TEXT NOT NULL,
    tools_required JSONB NOT NULL DEFAULT '[]',
    mcps JSONB NOT NULL DEFAULT '[]',
    knowledge JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);