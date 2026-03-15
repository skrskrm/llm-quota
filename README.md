# llmquota

`llmquota` is a small CLI for checking subscription usage across Claude, Gemini, and DeepSeek from locally logged-in CLI sessions and API keys.

## Install

```bash
npm install -g llmquota
```

`npm install` will attempt to install `LLMQuotaLogos.ttf` and
`CellGaugeSymbols.ttf` into your user font directory.

To skip auto-install (for CI/sandboxed installs):

```bash
OU_SKIP_FONT_INSTALL=1 npm install -g llmquota
```

## Usage

```bash
llmquota                              # JSON output (all providers)
llmquota --text                       # line-per-provider summary
llmquota --status                     # compact status line
llmquota --stacked                    # stacked dual-bar status
llmquota --stacked --bar-width 3
llmquota claude --status              # single provider
llmquota claude gemini --text         # multiple providers
llmquota setup-fonts                  # manually (re)install fonts
llmquota setup-fonts --font-dir ~/Library/Fonts
llmquota font-paths                   # print packaged source font paths
```

Positional arguments filter providers. Valid names: `claude`, `gemini`, `deepseek`.

## Provider setup

### Claude

Reads credentials from `~/.claude/.credentials.json` or macOS keychain.
Log in via the Claude CLI first.

### Gemini

Reads OAuth credentials from `~/.gemini/oauth_creds.json`.
Log in via the Gemini CLI first.

### DeepSeek

Set your API key as an environment variable:

```bash
export DEEPSEEK_API_KEY="sk-..."
```

DeepSeek returns account balance information (total, granted, topped-up) rather
than rate-limit percentages.

## Output modes

### JSON (default)

Prints a JSON array with one object per provider. Each object includes
usage percentages (Claude/Gemini) or balance info (DeepSeek), plan info,
and ISO-8601 reset timestamps where available.

When reset timestamps are present, extra fields are appended:

- `resetInSeconds` — object keyed by reset field name (e.g. `sessionReset`)
- `nextResetInSeconds` — soonest reset countdown
- `allResetsInSeconds` — latest reset countdown

### Text (`--text`)

One key=value line per provider with plan, usage percentages, reset
timestamps, and (for Claude) extra-usage dollars. DeepSeek shows balance
amounts instead.

### Status (`--status`)

Compact single-line output intended for shell prompts or status bars.
Each provider shows an icon, a percentage or balance, and a reset countdown.

Default separator is ` | `. Stacked mode uses a single space.

### Stacked status (`--stacked`)

Each provider is rendered as a two-lane stacked bar (via `cellgauge`)
instead of a plain percentage.

| Provider | Top lane (row 1)  | Bottom lane (row 2) |
|----------|--------------------|---------------------|
| Claude   | 5-hour session     | 7-day usage         |
| Gemini   | Pro usage          | Flash usage         |
| DeepSeek | granted balance %  | topped-up balance % |

## CLI flags

| Flag | Description |
|------|-------------|
| `--text` | Text output mode |
| `--status` | Status-line output mode |
| `--stacked` | Stacked dual-bar status (implies `--status`) |
| `--no-nf`, `--status-ascii` | Force ASCII icons (`Cl`, `Gm`, `Ds`) |
| `--bar-width <n>` | Bar width in cells (default `5`) |

## Font setup

`llmquota --status` and `llmquota --stacked` use glyph icons and PUA
bar symbols. For correct rendering, install:

- `LLMQuotaLogos.ttf`
- `CellGaugeSymbols.ttf`

Manual install command:

```bash
llmquota setup-fonts
```

Use `--font-dir` to override target directory:

```bash
llmquota setup-fonts --font-dir /path/to/fonts
```

### Icon mode

In `--status` mode, glyph icons are used by default. Pass `--no-nf` (or
`--status-ascii`) to switch to ASCII fallbacks (`Cl`, `Gm`, `Ds`).

Outside `--status` mode, icons default to ASCII.

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEEPSEEK_API_KEY` | DeepSeek API key (required for DeepSeek) | — |
| `OU_STATUS_STYLE` | Status style (`compact` or `stacked`) | `compact` |
| `OU_STATUS_SEPARATOR` | Separator between providers in status output | ` \| ` (compact) / ` ` (stacked) |
| `OU_STATUS_GLYPHS` | Enable/disable glyph icons (`1`/`true`/`yes`/`on` or `0`/`false`/`no`/`off`) | `true` in status mode |
| `OU_BAR_WIDTH` | Default bar width in cells | `5` |
| `OU_ICON_CLAUDE` | Custom Claude icon | (glyph default) |
| `OU_ICON_GEMINI` | Custom Gemini icon | (glyph default) |
| `OU_ICON_DEEPSEEK` | Custom DeepSeek icon | `Ds` |
| `OU_ICON_ERROR` | Custom error icon | (glyph default) |

CLI flags override environment variables when both are set.

## Notes

- Reads local auth files and macOS keychain entries for Claude and Gemini.
- DeepSeek uses API key authentication via `DEEPSEEK_API_KEY`.
- Designed for subscription usage tracking rather than API billing usage.
- Tokens are refreshed automatically when expired or stale (Claude/Gemini).
