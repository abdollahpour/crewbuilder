\c agent

CREATE TABLE IF NOT EXISTS agents (
    name TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    description TEXT NOT NULL,
    rules TEXT NOT NULL,
    tools JSONB NOT NULL DEFAULT '[]',
    mcps JSONB NOT NULL DEFAULT '[]',
    skills JSONB NOT NULL DEFAULT '[]',
    knowledge JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DELETE FROM agents;


INSERT INTO agents
(
    name,
    model,
    description,
    rules,
    mcps,
    skills,
    knowledge
)
VALUES
(
    'weather-lookup',
    'ollama/qwen3:8b',
    'Provides weather information for travel destinations.',
    $rules$
Extract city name from user information. Provide clear weather summaries.
    $rules$,
    '[]'::jsonb,
    '["weather-lookup"]'::jsonb,
    '[]'::jsonb
),
(
    'hotel-agent',
    'ollama/qwen3:8b',
    'Searches hotels and handles accommodation reservations.',
    $rules$
Ask for travel preferences before recommending hotels. Confirm reservations explicitly.
    $rules$,
    '[]'::jsonb,
    '["hotel-search"]'::jsonb,
    '[]'::jsonb
),
(
    'flight-agent',
    'ollama/qwen3:8b',
    'Searches flights and handles flight booking workflows.',
    $rules$
Collect required flight details before searching or booking.
    $rules$,
    '[]'::jsonb,
    '["flight-search"]'::jsonb,
    '[]'::jsonb
),
(
    'cities-knowledge',
    'ollama/qwen3:8b',
    'Answers questions about cities by looking up information in the cities knowledge base.',
    $rules$
You must answer city questions using only the KnowledgeSearchTool against the cities knowledge base. Do not use any other source, memory, or general knowledge. Call KnowledgeSearchTool with knowledge set to cities and a query for the city or topic asked about. If the tool returns no relevant passages or the city is not listed in the cities knowledge base, reply exactly: I have no information
    $rules$,
    '[]'::jsonb,
    '[]'::jsonb,
    '["cities"]'::jsonb
);
