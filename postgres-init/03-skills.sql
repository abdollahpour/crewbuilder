\c skill

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

DELETE FROM skills;

INSERT INTO skills
(
    name,
    description,
    skill_md,
    tools_required,
    mcps,
    knowledge
)
VALUES
(
    'weather-lookup',
    'Fetch weather information by providing a city name',
    $skill$
Use **only** the `HttpCallTool` tool. Never invent coordinates or weather values.

# Workflow

## Step 1: Get City Coordinates

City name is required from user.

Use:

```
https://geocoding-api.open-meteo.com/v1/search?name=<CITY_NAME>&count=1
```

HttpCallTool request. Pass query params as a **key/value list** (any keys allowed):

```json
{
  "method": "GET",
  "url": "https://geocoding-api.open-meteo.com/v1/search",
  "params": [
    {"key": "name", "value": "<CITY_NAME>"},
    {"key": "count", "value": 1}
  ]
}
```

Example:

```json
{
  "method": "GET",
  "url": "https://geocoding-api.open-meteo.com/v1/search",
  "params": [
    {"key": "name", "value": "Berlin"},
    {"key": "count", "value": 1}
  ]
}
```

Expected response:

```json
{
  "results": [
    {
      "latitude": 52.5200,
      "longitude": 13.4050
    }
  ]
}
```

Extract:

- `latitude`
- `longitude`

If no results are returned, tell the user that the city could not be found.

---

## Step 2: Get Current Weather

Use the coordinates obtained from the geocoding step.

Use:

```
https://api.open-meteo.com/v1/forecast?latitude=<LATITUDE>&longitude=<LONGITUDE>&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m
```

HttpCallTool request:

```json
{
  "method": "GET",
  "url": "https://api.open-meteo.com/v1/forecast",
  "params": [
    {"key": "latitude", "value": "<LATITUDE>"},
    {"key": "longitude", "value": "<LONGITUDE>"},
    {"key": "current", "value": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"}
  ]
}
```

Example:

```json
{
  "method": "GET",
  "url": "https://api.open-meteo.com/v1/forecast",
  "params": [
    {"key": "latitude", "value": "52.5200"},
    {"key": "longitude", "value": "13.4050"},
    {"key": "current", "value": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"}
  ]
}
```

Expected response:

```json
{
  "current": {
    "temperature_2m": 18.5,
    "relative_humidity_2m": 60,
    "weather_code": 1,
    "wind_speed_10m": 12.4
  }
}
```

Extract:

- `temperature_2m`
- `relative_humidity_2m`
- `weather_code`
- `wind_speed_10m`

---

# More Rules

1. City name is required. If you don't know return error.
2. `params` is required and must include the city `name` for geocoding. Never pass an empty list.
3. Always perform city geocoding before requesting weather.
4. Never guess latitude or longitude values.
5. Use the first location result returned by the geocoding API.
6. If the city lookup fails, stop and report the failure.
7. If the weather request fails, retry only 2 times then report the HTTP error.
8. Present the final weather result clearly.
9. Follow examples.

---

# Example Final Response

```
Weather for Berlin:

Temperature: 18.5°C
Humidity: 60%
Wind speed: 12.4 km/h
Weather code: 1
```

$skill$,
'["HttpCallTool"]'::jsonb,
'[]'::jsonb,
'[]'::jsonb
),
(
    'hotel-search',
    'Searches and recommends hotels using the hotel MCP service.',
    $skill$

# Hotel Search Skill

## Purpose

Find accommodation options.

## Workflow

1. Collect:
   - Destination
   - Check-in date
   - Check-out date
   - Budget
   - Preferences

2. Call hotel MCP tools.

3. Present:
   - Hotel name
   - Price
   - Rating
   - Availability

## MCP Tools

Uses:

- search_hotels
- reserve_room

## Rules

- Never claim a booking happened unless reservation succeeds.

$skill$,
'[]'::jsonb,
'["book-hotel"]'::jsonb,
'[]'::jsonb
),
(
    'flight-search',
    'Searches and books flights using the flight MCP service.',
    $skill$

# Flight Search Skill

## Purpose

Help users find flights.

## Workflow

1. Collect:
   - Origin
   - Destination
   - Travel date
   - Travelers

2. Call flight MCP tools.

3. Present:
   - Airline
   - Route
   - Price
   - Duration

## MCP Tools

Use `book-flight` mcp to search for flights.

## Rules

- Never fabricate flight availability.
- Try to find out Travel date from details provided by the user.
- If you only have month information, and not the exact date, search flights for start of the month until the end.
- If there is no information about `Travelers`, consider one passenger.

$skill$,
'[]'::jsonb,
'["book-flight"]'::jsonb,
'[]'::jsonb
);
