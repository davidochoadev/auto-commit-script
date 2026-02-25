#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import ora from "ora";
import simpleGit from "simple-git";

const git = simpleGit();

// Icone Powerlevel10k (nerdfont-complete) - stesso set di p10k
// https://github.com/romkatv/powerlevel10k - richiede Nerd Font per  OK FAIL branch commit
const p10k = {
  first: "\u256D\u2500",   // ╭─ MULTILINE_FIRST_PROMPT_PREFIX
  line: "\u251C\u2500",   // ├─ MULTILINE_NEWLINE_PROMPT_PREFIX
  last: "\u2570\u2500",   // ╰─ MULTILINE_LAST_PROMPT_PREFIX
  ruler: "\u2500",        // ─ RULER_CHAR
  ok: "\uF00C",          //  OK_ICON (check)
  fail: "\uF00D",        //  FAIL_ICON (times)
  branch: "\uF126",      //  VCS_BRANCH_ICON
  commit: "\uE729",      //  VCS_COMMIT_ICON
  git: "\uF1D3",         //  VCS_GIT_ICON
};

const COMMIT_TYPES = {
  fix: {
    prefix: "Fix",
    label: "fix",
    success: "Fix completato",
    icon: "🛠",
  },
  feat: {
    prefix: "Feat",
    label: "feat",
    success: "Feature completata",
    icon: "✅",
  },
  refactoring: {
    prefix: "Refactoring",
    label: "refactoring",
    success: "Refactoring completato",
    icon: "♻️",
  },
  first: {
    prefix: "First Commit",
    label: "first",
    success: "Primo commit e push completati",
    icon: "🚀",
  },
  default: {
    prefix: "Automatic Commit",
    label: "commit",
    success: "Commit completato",
    icon: "🤖",
  },
};

const DEFAULT_MESSAGE = "General Edits on Current Branch";

function printHelp() {
  const lines = [
    "",
    "  commit [tipo] [messaggio] [opzioni]",
    "",
    "  Tipi (con emoji):",
    "    fix          🛠  Fix / correzioni",
    "    feat         ✅  Nuova feature",
    "    refactoring  ♻️  Refactoring",
    "    first        🚀  Primo commit (init + add + commit + main + remote + push)",
    "    (nessuno)    🤖  Commit automatico con messaggio di default",
    "",
    "  Opzioni:",
    "    -h, --help     Mostra questo aiuto",
    "    -n, --no-push  Solo add + commit, senza push",
    "    --branch nome  Per 'first': usa questo branch invece di main",
    "",
    "  Esempi:",
    "    commit",
    "    commit fix \"corretto bug nel login\"",
    "    commit feat \"aggiunto export\" --no-push",
    "    commit first \"https://github.com/user/repo.git\"",
    "    commit first \"https://github.com/user/repo.git\" --branch develop",
    "",
  ];
  console.log(lines.join("\n"));
}

function getArgs(argv = process.argv.slice(2)) {
  if (argv[0] === "--help" || argv[0] === "-h") {
    return { help: true };
  }

  const noPush = argv.includes("--no-push") || argv.includes("-n");
  const branchIdx = argv.indexOf("--branch");
  const branchName = branchIdx >= 0 && argv[branchIdx + 1] ? argv[branchIdx + 1] : "main";

  const filtered = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--branch") {
      i++;
      continue;
    }
    if (["--help", "-h", "--no-push", "-n"].includes(argv[i])) continue;
    filtered.push(argv[i]);
  }

  const type = filtered[0];
  const message = filtered.slice(1).join(" ").trim() || DEFAULT_MESSAGE;
  return { type, message, noPush, branchName };
}

async function getCurrentBranch() {
  const { current } = await git.branch();
  return current;
}

async function isRepo() {
  try {
    return await git.checkIsRepo();
  } catch {
    return false;
  }
}

async function runStep(label, fn) {
  const spin = ora({ text: chalk.dim(p10k.line + " " + label), color: "cyan" }).start();
  await fn();
  spin.succeed(chalk.dim(p10k.line + " " + label));
}

function printHeader(config) {
  const icon = config.icon || "";
  console.log();
  console.log(chalk.cyan(p10k.first) + " " + (icon ? icon + " " : "") + chalk.bold(config.label));
  console.log();
}

function printSuccess(config, message, branch, extra = null) {
  const icon = config.icon ? config.icon + " " : "";
  console.log(chalk.green(p10k.ok) + " " + icon + chalk.bold(config.success));
  console.log(chalk.dim("  " + p10k.branch + "  ") + branch);
  console.log(chalk.dim("  " + p10k.commit + " ") + message);
  if (extra) console.log(chalk.dim("  " + p10k.git + "  ") + extra);
  console.log();
}

function printError(errMessage, hint = null) {
  console.error(chalk.red(p10k.fail) + " " + chalk.bold("commit fallito"));
  console.error(chalk.dim("  " + (errMessage || "")));
  if (hint) console.error(chalk.dim("  → " + hint));
  console.error();
}

function humanError(err) {
  const msg = (err && err.message) ? String(err.message) : String(err);
  if (msg === "NOTHING_TO_COMMIT") {
    return { message: "Niente da committare, working tree pulido.", hint: null };
  }
  const lower = msg.toLowerCase();
  if (lower.includes("nothing to commit") || lower.includes("working tree clean")) {
    return { message: "Niente da committare, working tree pulido.", hint: null };
  }
  if (lower.includes("not a git repository") || lower.includes("not a git repo")) {
    return { message: "Non sei in una repository Git.", hint: 'Esegui "git init" o usa "commit first \"url-remote\"" per il primo commit.' };
  }
  if (lower.includes("push") && (lower.includes("rejected") || lower.includes("failed") || lower.includes("non-fast-forward"))) {
    return { message: "Push rifiutato.", hint: "Prova a fare pull prima: git pull --rebase origin <branch>" };
  }
  if (lower.includes("authentication") || lower.includes("permission") || lower.includes("denied") || lower.includes("403")) {
    return { message: "Errore di autenticazione con il remote.", hint: "Verifica credenziali, SSH key o token." };
  }
  if (lower.includes("could not read from remote") || lower.includes("connection") || lower.includes("network")) {
    return { message: "Impossibile raggiungere il remote.", hint: "Controlla connessione e URL del remote." };
  }
  return { message: msg, hint: null };
}

async function doAddCommitPush(prefix, message, branch, options = {}) {
  const { noPush = false } = options;

  await runStep("staging", () => git.add("."));

  const status = await git.status();
  if (status.files.length === 0) {
    throw new Error("NOTHING_TO_COMMIT");
  }

  await runStep("commit", () => git.commit(`${prefix}: ${message}`));

  if (!noPush) {
    await runStep("push", () => git.push("origin", branch));
  }
}

async function runFirstCommit(remoteUrl, branchName = "main") {
  if (!remoteUrl) {
    throw new Error('Per "first" serve l\'URL del remote: commit first "https://github.com/user/repo.git"');
  }

  await runStep("init", () => git.init("."));
  await runStep("staging", () => git.add("."));
  await runStep("commit", () => git.commit(COMMIT_TYPES.first.prefix));
  await runStep("branch " + branchName, () => git.raw(["branch", "-m", branchName]));
  await runStep("origin", () => git.addRemote("origin", remoteUrl));
  await runStep("push", () => git.push(["-u", "origin", branchName]));

  printSuccess(COMMIT_TYPES.first, "Primo commit", branchName, remoteUrl);
}

async function runNormalCommit(config, message, branch, options = {}) {
  printHeader(config);
  await doAddCommitPush(config.prefix, message, branch, options);
  printSuccess(config, `${config.prefix}: ${message}`, branch);
}

async function main() {
  const args = getArgs();
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  const { type, message, noPush, branchName } = args;
  const config = COMMIT_TYPES[type] || COMMIT_TYPES.default;

  if (type === "first") {
    printHeader(config);
    await runFirstCommit(message, branchName);
    return;
  }

  const repo = await isRepo();
  if (!repo) {
    throw new Error("Non sei in una repository Git. Esegui 'git init' o usa 'commit first \"url-remote\"' per il primo commit.");
  }

  const branch = await getCurrentBranch();
  await runNormalCommit(config, message, branch, { noPush });
}

const scriptPath = fileURLToPath(import.meta.url);
const invoked = process.argv[1];
let isMain = false;
if (invoked) {
  try {
    isMain = realpathSync(invoked) === realpathSync(scriptPath);
  } catch {
    isMain = invoked === scriptPath || invoked.endsWith("commit.js");
  }
}
if (isMain) {
  main().catch((err) => {
    console.log();
    const { message, hint } = humanError(err);
    printError(message, hint);
    process.exit(err && err.message === "NOTHING_TO_COMMIT" ? 0 : 1);
  });
}

export { getArgs, COMMIT_TYPES, DEFAULT_MESSAGE };
