# Homework 1 — LLM + Tool Use

Python script that calls the OpenAI API (`gpt-4o-mini`), uses a tool (free weather
lookup via [Open-Meteo](https://open-meteo.com/) — no API key required), and feeds
the tool's result back to the LLM so it can produce the final natural-language answer.

## Flow

1. User prompt → `gpt-4o-mini`.
2. Model decides to call `get_current_weather(city=...)`.
3. Script calls Open-Meteo (geocode + forecast) and gets current conditions.
4. Tool result is sent **back to the LLM** in a second request.
5. LLM returns a natural-language answer that uses the real weather data.

## Setup

Copy the env template and add your OpenAI key:

```bash
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...
```

## Run

### Directly with uv

```bash
uv run main.py
```

### Or via an explicit venv

```bash
uv venv
source .venv/bin/activate   # on Windows: .venv\Scripts\activate
uv sync
python main.py
```

## Expected Output

- A printed first LLM response containing a `tool_calls` entry.
- A printed tool result dict (`city`, `country`, `temperature_c`, `wind_speed_kmh`, `weather_code`).
- A printed second LLM response that uses the tool result.
- A final natural-language answer, e.g. *"It's currently 12 °C and overcast in Prague…"*.
