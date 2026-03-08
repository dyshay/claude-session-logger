#!/usr/bin/env node

// Installs session-logger hooks into Claude Code global settings
// by MERGING with existing hooks — never overwrites.

const fs = require("fs");
const path = require("path");
const os = require("os");

const PLUGIN_ID = "session-logger";
const SETTINGS_PATH = path.join(os.homedir(), ".claude", "settings.json");
const SCRIPTS_DIR = path.join(__dirname, "scripts");

function buildHooks() {
  const startCmd = `node "${path.join(SCRIPTS_DIR, "session-start.js")}"`;
  const endCmd = `node "${path.join(SCRIPTS_DIR, "session-end.js")}"`;

  return {
    SessionStart: [
      {
        matcher: "startup",
        hooks: [
          {
            type: "command",
            command: startCmd,
            statusMessage: `[${PLUGIN_ID}] Saving HEAD hash`,
          },
        ],
      },
    ],
    SessionEnd: [
      {
        hooks: [
          {
            type: "command",
            command: endCmd,
            statusMessage: `[${PLUGIN_ID}] Writing session diff log`,
          },
        ],
      },
    ],
  };
}

function isOurEntry(matcherGroup) {
  return (matcherGroup.hooks || []).some(
    (h) => h.statusMessage && h.statusMessage.startsWith(`[${PLUGIN_ID}]`)
  );
}

function install() {
  // Read existing settings
  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
  } else {
    // Ensure .claude directory exists
    fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  }

  if (!settings.hooks) {
    settings.hooks = {};
  }

  const newHooks = buildHooks();

  for (const [event, entries] of Object.entries(newHooks)) {
    if (!settings.hooks[event]) {
      settings.hooks[event] = [];
    }

    // Remove any previous install of this plugin (idempotent)
    settings.hooks[event] = settings.hooks[event].filter(
      (group) => !isOurEntry(group)
    );

    // Append our entries
    settings.hooks[event].push(...entries);
  }

  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");

  console.log(`[${PLUGIN_ID}] Hooks installed into ${SETTINGS_PATH}`);
  console.log(`  - SessionStart: saves HEAD hash on startup`);
  console.log(`  - SessionEnd: writes diff to .claude/session-logs/`);
  console.log();
  console.log(`To uninstall: node "${path.join(__dirname, "uninstall.js")}"`);
}

install();
