# claude-session-logger

[![npm version](https://img.shields.io/npm/v/claude-session-logger)](https://www.npmjs.com/package/claude-session-logger)
[![CI](https://github.com/dyshay/claude-session-logger/actions/workflows/ci.yml/badge.svg)](https://github.com/dyshay/claude-session-logger/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Automatically captures a full `git diff` of everything that changed during a [Claude Code](https://docs.anthropic.com/en/docs/claude-code) session.

Stop losing track of what happened during a 30-minute coding session. Every change — committed or not — is saved to a `.diff` file when the session ends.

## Quick start

```bash
npx claude-session-logger
```

Done. Your existing Claude Code hooks are preserved — nothing gets overwritten.

## How it works

```
 Session start                             Session end
      │                                         │
      ▼                                         ▼
  Save HEAD hash ─── you work for 30 min ─── git diff <saved-hash>
  (temp file)        edit, commit, refactor      │
                                                 ▼
                                     .claude/session-logs/
                                     2025-06-15_14-30-00.diff
```

| Step | What happens |
|------|-------------|
| **1. Session starts** | Saves the current `HEAD` commit hash to a temp file |
| **2. You work** | Edit files, commit, refactor — business as usual |
| **3. Session ends** | Runs `git diff <saved-hash>` to capture everything that changed |
| **4. Log written** | Saves the diff to `.claude/session-logs/YYYY-MM-DD_HH-mm-ss.diff` |

## Output

```
your-project/
└── .claude/
    └── session-logs/
        ├── 2025-06-15_14-30-00.diff
        ├── 2025-06-15_16-45-12.diff
        └── 2025-06-16_09-00-33.diff
```

Each `.diff` file contains a standard unified diff. If nothing changed during the session, the file mentions it explicitly.

## Uninstall

```bash
npx claude-session-logger uninstall
```

Only removes session-logger hooks. Other hooks stay intact.

## How hooks are registered

The installer merges two [Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) into `~/.claude/settings.json`:

| Hook | Trigger | Action |
|------|---------|--------|
| `SessionStart` | New session (`startup`) | Saves `HEAD` hash to temp file |
| `SessionEnd` | Any exit reason | Generates diff, writes log, cleans up |

- Existing hooks are **never** modified or removed
- Installation is **idempotent** — running it twice won't create duplicates
- Zero dependencies — pure Node.js

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- Node.js >= 18
- Git

## License

[MIT](LICENSE)
