---
name: "component-scaffold"
description: "Use when the user wants a new empty React component skeleton — generates the .tsx file, a co-located .test.tsx file, and (optionally) appends a re-export to src/components/index.ts. Does not implement behaviour; only the scaffold."
---

# Component Scaffold

Create the minimal, idiomatic skeleton for a new React + TypeScript + Tailwind
component in `src/components/`. This skill produces **structure**, not behaviour
— the user (or the `ui-component-builder` subagent) fills in the rendering and
the assertions.

## Inputs

- **name** (PascalCase, required) — e.g. `WeatherCard`
- **props** (optional) — comma-separated `name: type` pairs, e.g.
  `city: string, tempC: number, onRefresh: () => void`

If the user gave only a vague name, ask for the props once. Don't invent props.

## What this skill writes

### 1. `src/components/<Name>.tsx`

```tsx
export type Props = {
  // <props go here, one per line>
};

export default function <Name>(props: Props) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      {/* TODO: render */}
    </div>
  );
}
```

If `props` was provided, expand it into typed fields. Otherwise leave the
type body empty with a placeholder comment.

### 2. `src/components/<Name>.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import <Name> from './<Name>';

describe('<Name>', () => {
  it('renders', () => {
    render(<<Name> {/* fill in required props */} />);
    // TODO: replace with a real assertion
    expect(screen.getByRole).toBeDefined();
  });
});
```

### 3. (optional) re-export

If `src/components/index.ts` exists, append `export { default as <Name> } from './<Name>';`.
If it does not exist, skip — don't create it.

## After scaffolding

Report exactly which files were written. Suggest the next step:

> Next: invoke the `ui-component-builder` subagent or implement the component
> directly. Then run `npm run test:run -- src/components/<Name>.test.tsx`.

## Rules
- **Don't implement.** Leave the body as a TODO.
- **Don't auto-wire** the component into `App.tsx` — that's a separate decision.
- **Refuse** if the name isn't PascalCase or the file already exists. Ask the
  user how to proceed.
