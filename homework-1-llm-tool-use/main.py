import json
import os
from pprint import pprint

import requests
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

MODEL = "gpt-4o-mini"

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


def geocode_city(city: str) -> dict:
    resp = requests.get(
        GEOCODE_URL,
        params={"name": city, "count": 1, "language": "en", "format": "json"},
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json().get("results") or []
    if not results:
        return {}
    hit = results[0]
    return {
        "latitude": hit["latitude"],
        "longitude": hit["longitude"],
        "name": hit.get("name", city),
        "country": hit.get("country", ""),
    }


def get_current_weather(city: str) -> dict:
    try:
        location = geocode_city(city)
    except requests.RequestException as exc:
        return {"error": f"Geocoding failed: {exc}"}

    if not location:
        return {"error": f"City '{city}' not found."}

    try:
        resp = requests.get(
            FORECAST_URL,
            params={
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "current": "temperature_2m,wind_speed_10m,weather_code",
            },
            timeout=10,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        return {"error": f"Weather lookup failed: {exc}"}

    current = resp.json().get("current", {})
    return {
        "city": location["name"],
        "country": location["country"],
        "temperature_c": current.get("temperature_2m"),
        "wind_speed_kmh": current.get("wind_speed_10m"),
        "weather_code": current.get("weather_code"),
    }


tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": (
                "Get the current weather (temperature, wind speed, weather code) "
                "for a given city using the free Open-Meteo API."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City name, e.g. 'Prague' or 'New York'.",
                    }
                },
                "required": ["city"],
            },
        },
    }
]

available_functions = {
    "get_current_weather": get_current_weather,
}


def run_conversation(user_prompt: str) -> str | None:
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant. If the user asks about current "
                "weather, call the get_current_weather tool instead of guessing."
            ),
        },
        {"role": "user", "content": user_prompt},
    ]

    first = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    first_message = first.choices[0].message
    print("--- First response (from LLM): ---")
    pprint(first_message.model_dump())

    if not first_message.tool_calls:
        return first_message.content

    messages.append(
        {
            "role": "assistant",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in first_message.tool_calls
            ],
        }
    )

    for tool_call in first_message.tool_calls:
        function_name = tool_call.function.name
        function_args = json.loads(tool_call.function.arguments)
        function_result = available_functions[function_name](**function_args)
        print(f"--- Tool result for {function_name}({function_args}): ---")
        pprint(function_result)
        messages.append(
            {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": function_name,
                "content": json.dumps(function_result),
            }
        )

    second = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    final_message = second.choices[0].message
    print("--- Second response (from LLM, after tool result): ---")
    pprint(final_message.model_dump())
    return final_message.content


if __name__ == "__main__":
    prompt = "What's the weather like in Prague right now? Should I take a jacket?"
    print(f"USER: {prompt}\n")
    answer = run_conversation(prompt)
    print("\n=== FINAL ANSWER ===")
    print(answer)
