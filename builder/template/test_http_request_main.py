"""Manual test runner for HttpCallTool against the Open-Meteo forecast API.

Run from crew/template:
    python test_http_request_main.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "tools"))

from http_call_tool import HttpCallTool

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
FORECAST_PARAMS = {
    "latitude": 52.5200,
    "longitude": 13.4050,
    "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
}


def run_case(name: str, passed: bool, detail: str = "") -> bool:
    status = "PASS" if passed else "FAIL"
    line = f"[{status}] {name}"
    if detail:
        line = f"{line}: {detail}"
    print(line)
    return passed


def main() -> int:
    tool = HttpCallTool()
    passed = 0
    failed = 0

    print(
        "Testing HttpCallTool against Open-Meteo forecast "
        f"(Berlin: {FORECAST_PARAMS['latitude']}, {FORECAST_PARAMS['longitude']})\n"
    )

    response = tool._run("GET", FORECAST_URL, params=FORECAST_PARAMS)
    ok = not response.startswith("HTTP request failed:")
    if not run_case("Fetch forecast", ok):
        failed += 1
        print(response)
        print(f"\n{passed} passed, {failed} failed")
        return 1

    passed += 1

    try:
        data = json.loads(response)
    except json.JSONDecodeError as exc:
        run_case("Parse JSON response", False, str(exc))
        failed += 1
        print(f"\n{passed} passed, {failed} failed")
        return 1

    if run_case("Parse JSON response", True):
        passed += 1
    else:
        failed += 1

    checks = [
        ("latitude is Berlin", data.get("latitude") == 52.52),
        ("longitude is Berlin", data.get("longitude") == 13.4),
        ("current block present", isinstance(data.get("current"), dict)),
    ]

    current = data.get("current", {})
    for field in ("temperature_2m", "relative_humidity_2m", "weather_code", "wind_speed_10m"):
        checks.append((f"current.{field} present", field in current))

    for name, ok in checks:
        if run_case(name, ok):
            passed += 1
        else:
            failed += 1

    if isinstance(current, dict) and current:
        summary = (
            f"{current.get('temperature_2m')}°C, "
            f"humidity {current.get('relative_humidity_2m')}%, "
            f"weather code {current.get('weather_code')}, "
            f"wind {current.get('wind_speed_10m')} km/h"
        )
        print(f"\nCurrent conditions: {summary}")

    print(f"\n{passed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
