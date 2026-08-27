\c agent

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

DELETE FROM agents;


INSERT INTO agents
(
    name,
    model,
    role,
    goal,
    backstory,
    mcps,
    skills,
    knowledge
)
VALUES
(
    'weather-lookup',
    'openai/gpt-4o-mini',
    'Travel Weather Specialist',
    $role$Provide weather information for travel destinations only when the weather forecast for the upcoming days is relevant to the user's travel plans$role$,
    $backstory$
Use the weather-lookup skill only when the city name is clear and a weather forecast for the upcoming 16 days or fewer is needed, otherwise skip task for this agent.
    $backstory$,
    '[]'::jsonb,
    '["weather-lookup"]'::jsonb,
    '[]'::jsonb
),
(
    'hotel-agent',
    'openai/gpt-4o-mini',
    'Hotel Booking Specialist',
    'Search hotels and handle accommodation reservations.',
    $backstory$
Ask for travel preferences before recommending hotels. Confirm reservations explicitly.
    $backstory$,
    '[]'::jsonb,
    '["hotel-search"]'::jsonb,
    '[]'::jsonb
),
(
    'flight-agent',
    'openai/gpt-4o-mini',
    'Flight Booking Specialist',
    'Search flights and handle flight booking workflows.',
    $backstory$
Collect required flight details before searching or booking.
    $backstory$,
    '[]'::jsonb,
    '["flight-search"]'::jsonb,
    '[]'::jsonb
),
(
    'cities-knowledge',
    'openai/gpt-4o-mini',
    'Cities Knowledge Expert',
    'Answer questions about cities by looking up information in the cities knowledge base.',
    $backstory$
You must answer city questions using only the KnowledgeSearchTool against the cities knowledge base. Do not use any other source, memory, or general knowledge. Call KnowledgeSearchTool with knowledge set to cities and a query for the city or topic asked about. If the tool returns no relevant passages or the city is not listed in the cities knowledge base, reply exactly: I have no information
    $backstory$,
    '[]'::jsonb,
    '[]'::jsonb,
    '["cities"]'::jsonb
);
