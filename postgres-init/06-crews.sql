\c crew

CREATE TABLE IF NOT EXISTS crews (
    name TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    rules TEXT NOT NULL,
    agents JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DELETE FROM crews;

INSERT INTO crews
(
    name,
    model,
    rules,
    agents
)
VALUES
(
    'travel-assistant',
    'ollama/qwen3:8b',
    $rules$
Coordinate travel planning by delegating tasks to weather, hotel, flight, and city-knowledge specialists.

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
    $rules$,
    $agents$
[
    "weather-lookup",
    "hotel-agent",
    "flight-agent",
    "cities-knowledge"
]
    $agents$
);