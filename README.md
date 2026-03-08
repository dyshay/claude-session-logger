# claude-session-logger

Automatically captures a full `git diff` of everything that changed during a Claude Code session and saves it to a `.diff` file.

No more losing track of what happened during a 30-minute coding session.

## Install

```bash
npx claude-session-logger
```

That's it. Your existing hooks are preserved — nothing gets overwritten.

## Uninstall

```bash
npx claude-session-logger uninstall
```

Only removes session-logger hooks. Your other hooks stay intact.

## How it works

1. **Session starts** — saves the current `HEAD` commit hash to a temp file
2. **You work** — edit files, commit, whatever
3. **Session ends** — runs `git diff <saved-hash>`, capturing everything that changed (commits + unstaged edits)
4. **Writes the diff** to `<your-project>/.claude/session-logs/YYYY-MM-DD_HH-mm-ss.diff`

```
Session start                          Session end
    │                                      │
    ▼                                      ▼
  HEAD = a3f2b1c                    git diff a3f2b1c
  (saved to temp)                   → writes .diff log
                                    → cleans up temp
```

## Output

After each session, check your project:

```
.claude/session-logs/
├── 2025-06-15_14-30-00.diff
├── 2025-06-15_16-45-12.diff
└── 2025-06-16_09-00-33.diff
```

If nothing changed, the file says so instead of being empty.

## Requirements

- Node.js >= 18
- Git
- Claude Code

## How hooks are registered

The installer merges two hooks into `~/.claude/settings.json`:

- `SessionStart` (matcher: `startup`) — runs `session-start.js`
- `SessionEnd` (all exit reasons) — runs `session-end.js`

Existing hooks are never modified. The install is idempotent — running it twice won't create duplicates.

## License

MIT
