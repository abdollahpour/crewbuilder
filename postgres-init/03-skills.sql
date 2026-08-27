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
    'Fetch the weather forecast for a specified city for up to 16 days ahead',
    $skill$
# Weather Agent Skill

Use **only** the `HttpCallTool` tool. Never invent coordinates, dates, or weather values.

# Workflow

## Step 1: Get City Coordinates

City name is required from the user.

Use:

```text
https://geocoding-api.open-meteo.com/v1/search?name=<CITY_NAME>&count=1
```

HttpCallTool request. Pass query params as a **key/value list**:

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

* `latitude`
* `longitude`

If no results are returned, tell the user that the city could not be found and stop.

---

## Step 2: Determine Whether the User Wants Current or Future Weather

If the user asks for **current weather**, use the `current` forecast request described in Step 3.

If the user asks for weather on a **specific future day**, such as:

* "weather in Berlin tomorrow"
* "weather in 5 days"
* "weather on August 31"
* "what will the weather be next Monday?"

you must use the **daily forecast** endpoint.

Never assume that "in 5 days" means a specific calendar date without calculating it from the current date.

The current date must come from the system/runtime context. Do not invent or guess today's date.

---

## Step 3: Get Current Weather

Use the coordinates obtained from the geocoding step.

Use:

```text
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

* `temperature_2m`
* `relative_humidity_2m`
* `weather_code`
* `wind_speed_10m`

---

## Step 4: Get Weather for a Specific Future Day

For a future date, use Open-Meteo's `daily` forecast parameters.

Use:

```text
https://api.open-meteo.com/v1/forecast
```

with:

```text
latitude=<LATITUDE>
longitude=<LONGITUDE>
start_date=<YYYY-MM-DD>
end_date=<YYYY-MM-DD>
daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max
timezone=auto
```

HttpCallTool request:

```json
{
  "method": "GET",
  "url": "https://api.open-meteo.com/v1/forecast",
  "params": [
    {"key": "latitude", "value": "<LATITUDE>"},
    {"key": "longitude", "value": "<LONGITUDE>"},
    {"key": "start_date", "value": "<YYYY-MM-DD>"},
    {"key": "end_date", "value": "<YYYY-MM-DD>"},
    {"key": "daily", "value": "temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max"},
    {"key": "timezone", "value": "auto"}
  ]
}
```

Example for a specific date:

```json
{
  "method": "GET",
  "url": "https://api.open-meteo.com/v1/forecast",
  "params": [
    {"key": "latitude", "value": "52.5200"},
    {"key": "longitude", "value": "13.4050"},
    {"key": "start_date", "value": "2026-08-31"},
    {"key": "end_date", "value": "2026-08-31"},
    {"key": "daily", "value": "temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max"},
    {"key": "timezone", "value": "auto"}
  ]
}
```

Expected response:

```json
{
  "daily": {
    "time": ["2026-08-31"],
    "temperature_2m_max": [24.1],
    "temperature_2m_min": [15.8],
    "weather_code": [2],
    "wind_speed_10m_max": [18.7]
  }
}
```

Extract the values corresponding to the requested date:

* `temperature_2m_max`
* `temperature_2m_min`
* `weather_code`
* `wind_speed_10m_max`

Do not invent values if any requested value is missing.

---

## Step 5: Handling Relative Dates

When the user specifies a relative date, calculate the target calendar date using the current date from the runtime context.

Examples:

### "Tomorrow"

If today is `2026-08-26`, tomorrow is:

```text
2026-08-27
```

Request:

```json
{
  "key": "start_date",
  "value": "2026-08-27"
}
```

and:

```json
{
  "key": "end_date",
  "value": "2026-08-27"
}
```

### "In 5 days"

If today is `2026-08-26`, five days later is:

```text
2026-08-31
```

Request:

```json
{
  "key": "start_date",
  "value": "2026-08-31"
}
```

and:

```json
{
  "key": "end_date",
  "value": "2026-08-31"
}
```

### "Next Monday"

Calculate the next Monday based on the current date. Then request that exact date using `start_date` and `end_date`.

Never guess the resulting date.

---

# More Rules

1. City name is required. If it is missing, return an error.
2. `params` is required and must never be an empty list.
3. Always perform city geocoding before requesting weather.
4. Never guess latitude or longitude.
5. Use the first location result returned by the geocoding API.
6. If the city lookup fails, stop and report the failure.
7. For current weather, use the `current` API parameters.
8. For a specific future day, use the `daily` API parameters.
9. Always use the exact calculated/requested date for `start_date` and `end_date`.
10. Never invent or guess a date.
11. For relative dates such as "tomorrow", "in 5 days", or "next Monday", calculate the date from the current runtime date.
12. If the requested date is outside the available Open-Meteo forecast range, report that the forecast is not available instead of inventing data.
13. If the weather request fails, retry only 2 times, then report the HTTP error.
14. Present the final weather result clearly.
15. Follow the examples.
16. Use `timezone=auto` for daily forecasts.
17. Do not request weather before successful geocoding.

---

# Example Final Response: Current Weather

```text
Weather for Berlin:

Temperature: 18.5°C
Humidity: 60%
Wind speed: 12.4 km/h
Weather code: 1
```

# Example Final Response: Future Weather

For a user asking:

```text
What's the weather in Berlin in 5 days?
```

```text
Weather for Berlin on August 31, 2026:

Maximum temperature: 24.1°C
Minimum temperature: 15.8°C
Maximum wind speed: 18.7 km/h
Weather code: 2
```

Do not add weather descriptions such as "partly cloudy" unless the corresponding `weather_code` is explicitly mapped using a reliable weather-code definition. Never infer a description from the numeric code.
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
