#!/usr/bin/env node

const arg = process.argv[2];

if (arg === "uninstall" || arg === "remove") {
  require("./uninstall");
} else {
  require("./install");
}
