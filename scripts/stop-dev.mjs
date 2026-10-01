import { execFileSync } from "node:child_process";

const ports = [3000, 3010, 3011, 3012, 3013];
let stopped = 0;

for (const port of ports) {
  const pids = exec("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"])
    .split(/\s+/)
    .filter(Boolean);

  for (const pid of pids) {
    const command = exec("ps", ["-p", pid, "-o", "command="]);
    if (!/\bnext\s+dev\b/.test(command)) continue;

    process.kill(Number(pid), "SIGTERM");
    console.log(`Stopped Next.js dev server on port ${port} (PID ${pid}).`);
    stopped++;
  }
}

if (!stopped) console.log("No Next.js dev servers found on ports 3000 or 3010–3013.");

function exec(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}
