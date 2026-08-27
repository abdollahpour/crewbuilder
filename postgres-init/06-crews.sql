\c crew

CREATE TABLE IF NOT EXISTS crews (
    name TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    role TEXT NOT NULL,
    goal TEXT NOT NULL,
    backstory TEXT NOT NULL,
    agents JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DELETE FROM crews;

INSERT INTO crews
(
    name,
    model,
    role,
    goal,
    backstory,
    agents
)
VALUES
(
    'travel-assistant',
    'openai/gpt-4o-mini',
    'Travel Planning Coordinator',
    'Coordinate travel planning by delegating tasks to weather, hotel, flight, and city-knowledge specialists.',
    $backstory$
General rules:
- Don't retry anything over 2 times.
- When you want to suggest something, keep the list limited to 3 items.

# Some sample follow

Find good destination for user:
1. Try to find information and dates in `city-knowledge`
2. From the information you found, extract city and data from knowledge
3. Use city as destination of the trip for fligh and hotel
4. If you do not have information about hotel price range, put something reasonable
5. Use the date and other information to find good tickets
6. Use the date and other information to find good hotels
7. Present that to the user
    $backstory$,
    $agents$
[
    "weather-lookup",
    "hotel-agent",
    "flight-agent",
    "cities-knowledge"
]
    $agents$
);
