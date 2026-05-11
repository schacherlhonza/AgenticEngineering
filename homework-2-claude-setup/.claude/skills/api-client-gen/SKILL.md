---
name: "api-client-gen"
description: "Use when the user wants a typed TypeScript HTTP client for a REST endpoint or an OpenAPI/JSON schema. Generates one function per endpoint in src/api/, with input/output types and HTTP error handling. Does NOT add new dependencies."
---

# API Client Generator

Generate a typed TS HTTP client in `src/api/` for a given endpoint. The output
matches this project's existing api-client conventions (see `src/api/openMeteo.ts`):

- One function per endpoint, named `<verb><Resource>` (e.g. `fetchForecast`)
- Input as a single typed object argument
- Return type explicitly typed
- `fetch` is used directly — no axios, no ky, no SDK
- Throws on non-OK responses
- No `any` anywhere in the signature

## Inputs the skill needs

Ask the user up to three short questions if not provided:

1. **Endpoint URL** — full URL, optionally with `${variable}` placeholders
2. **Inputs** — query/path params + their types
3. **Output shape** — either pasted JSON sample, an OpenAPI snippet, or a
   description like "an array of `{date: string, tempC: number}`"

If the user provides an OpenAPI doc URL, fetch it and read the `paths` /
`components.schemas` section.

## Output

Write a single file at `src/api/<resource>.ts`. Example shape:

```ts
const BASE_URL = 'https://api.example.com';

export type FetchForecastInput = {
  lat: number;
  lon: number;
  days?: number;
};

export type ForecastDay = {
  date: string;
  tempMin: number;
  tempMax: number;
};

export type FetchForecastResult = {
  city: string;
  daily: ForecastDay[];
};

export async function fetchForecast(
  input: FetchForecastInput,
): Promise<FetchForecastResult> {
  const params = new URLSearchParams({
    lat: String(input.lat),
    lon: String(input.lon),
    days: String(input.days ?? 7),
  });
  const url = `${BASE_URL}/forecast?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`fetchForecast failed: ${response.status} ${response.statusText}`);
  }

  const raw = (await response.json()) as FetchForecastResult;
  return raw;
}
```

## After writing the client

Suggest the user invoke the `test-writer` subagent to add a `<resource>.test.ts`
covering:

- Correct URL + querystring construction
- Successful response parsing into the typed shape
- Throwing on non-OK status

## Rules
- **No new dependencies.** Use `fetch` and `URLSearchParams`.
- **No `any` and no `unknown`** in the exported types. If the schema is genuinely
  open-ended, model that field as a discriminated union or a `Record<string, string>`.
- **Throw a descriptive Error** — include the URL and status code so debugging
  doesn't require reading the call site.
- **Don't add retry logic, caching, or auth headers** unless the user asks. This
  generator produces the minimum useful client.
- **Trim the response shape to what the caller needs.** If the API returns 30
  fields and the user named 4, expose 4. Aggressive shape trimming is cheaper to
  maintain than a faithful 30-field mirror.
