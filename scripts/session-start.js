const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

async function main() {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const sessionId = data.session_id;
  const cwd = data.cwd;

  if (!sessionId || !cwd) {
    process.exit(0);
  }

  try {
    const hash = execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf-8",
    }).trim();

    const tmpFile = path.join(
      os.tmpdir(),
      `claude-session-${sessionId}.json`
    );

    fs.writeFileSync(
      tmpFile,
      JSON.stringify({ hash, cwd, startedAt: new Date().toISOString() })
    );
  } catch {
    // Not a git repo or git not available — silently skip
  }
}

main().catch(() => process.exit(0));
