---
name: "screenshot"
description: "Use when the user asks for a Windows desktop screenshot (full screen, the active window, or a pixel region). For browser/Electron app captures prefer Playwright/DevTools; for Figma designs use the Figma MCP — this skill is for OS-level captures only."
---

# Screenshot Capture (Windows)

This project runs on Windows, so this skill is Windows-only. It wraps a
PowerShell helper that uses .NET's `System.Drawing` to grab the screen.

## Save-location rules

1. If the user gave a path, save there.
2. If the user asked for "a screenshot" with no path, save to
   `%USERPROFILE%\Pictures\Screenshots\` with a timestamped filename.
3. If Claude needs the screenshot for its own visual check, save to
   `$env:TEMP` and read it back.

## Tool priority

Prefer the most specific tool available:
- **Figma design** → use the Figma MCP (`mcp__figma__get_screenshot`)
- **Browser / web app** → use Playwright / DevTools / agent-browser if available
- **Electron / desktop app / whole-screen** → this skill

If a more specific tool is available, use it first.

## Usage

Run the helper:

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>\scripts\take_screenshot.ps1
```

### Default location (user said "take a screenshot")

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>\scripts\take_screenshot.ps1
```

### Temp location (Claude visual check)

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>\scripts\take_screenshot.ps1 -Mode temp
```

### Explicit path

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>\scripts\take_screenshot.ps1 -Path "C:\Temp\screen.png"
```

### Pixel region (x, y, width, height)

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>\scripts\take_screenshot.ps1 -Mode temp -Region 100,200,800,600
```

### Active window (foreground window only)

Ask the user to focus the window first, then:

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>\scripts\take_screenshot.ps1 -Mode temp -ActiveWindow
```

## Output

The script prints the saved file path on stdout. Always include that path in
your response to the user — use markdown link syntax so it's clickable in the
IDE.

## Multi-monitor

The default capture spans the virtual desktop (all monitors). Use `-Region` to
isolate a single monitor when needed.

## Error handling

- `Add-Type` errors → the user's PowerShell is locked down; fall back to
  asking them to take the screenshot manually.
- Empty / black image → the target window is on a different desktop or behind
  full-screen DRM (Netflix, banking app); explain and ask the user to focus
  the right window.
- Path errors → the parent folder doesn't exist; create it and retry.
