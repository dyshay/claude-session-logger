#!/usr/bin/env node

// Removes session-logger hooks from Claude Code global settings
// without touching any other hooks.

const fs = require("fs");
const path = require("path");
const os = require("os");

const PLUGIN_ID = "session-logger";
const SETTINGS_PATH = path.join(os.homedir(), ".claude", "settings.json");

function isOurEntry(matcherGroup) {
  return (matcherGroup.hooks || []).some(
    (h) => h.statusMessage && h.statusMessage.startsWith(`[${PLUGIN_ID}]`)
  );
}

function uninstall() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    console.log(`[${PLUGIN_ID}] No settings file found at ${SETTINGS_PATH}, nothing to do.`);
    return;
  }

  const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));

  if (!settings.hooks) {
    console.log(`[${PLUGIN_ID}] No hooks configured, nothing to do.`);
    return;
  }

  let removed = 0;

  for (const event of Object.keys(settings.hooks)) {
    const before = settings.hooks[event].length;
    settings.hooks[event] = settings.hooks[event].filter(
      (group) => !isOurEntry(group)
    );
    removed += before - settings.hooks[event].length;

    // Clean up empty arrays
    if (settings.hooks[event].length === 0) {
      delete settings.hooks[event];
    }
  }

  // Clean up empty hooks object
  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");

  if (removed > 0) {
    console.log(`[${PLUGIN_ID}] Removed ${removed} hook(s) from ${SETTINGS_PATH}`);
  } else {
    console.log(`[${PLUGIN_ID}] No session-logger hooks found, nothing to do.`);
  }
}

uninstall();
