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

  const tmpFile = path.join(os.tmpdir(), `claude-session-${sessionId}.json`);

  if (!fs.existsSync(tmpFile)) {
    process.exit(0);
  }

  try {
    const saved = JSON.parse(fs.readFileSync(tmpFile, "utf-8"));
    const startHash = saved.hash;

    // Validate hash to prevent shell injection
    if (!/^[0-9a-f]{40}$/i.test(startHash)) {
      process.exit(0);
    }

    const diff = execSync(`git diff --no-color ${startHash}`, {
      cwd,
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024, // 50 MB
    });

    // Build log directory
    const logDir = path.join(cwd, ".claude", "session-logs");
    fs.mkdirSync(logDir, { recursive: true });

    // Timestamp for filename
    const now = new Date();
    const ts = now
      .toISOString()
      .replace("T", "_")
      .replace(/:/g, "-")
      .slice(0, 19); // YYYY-MM-DD_HH-mm-ss

    const logFile = path.join(logDir, `${ts}.diff`);

    if (diff.length === 0) {
      fs.writeFileSync(
        logFile,
        `# No changes detected during this session\n# Started at: ${saved.startedAt}\n# Base commit: ${startHash}\n`
      );
    } else {
      fs.writeFileSync(logFile, diff);
    }
  } catch {
    // git failed — silently skip
  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(tmpFile);
    } catch {}
  }
}

main().catch(() => process.exit(0));
