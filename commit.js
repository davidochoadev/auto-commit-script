#!/usr/bin/env node
import chalk from "chalk";
import ora from "ora";
import simpleGit from "simple-git";

const git = simpleGit();

// Stile sobrio in linea con prompt zsh: ➜ ❯ ✓ ✗, colori tenui, niente box
const PROMPT = "➜";
const COMMIT_TYPES = {
  fix: {
    prefix: "Fix",
    label: "fix",
    success: "Fix completato",
  },
  feat: {
    prefix: "Feat",
    label: "feat",
    success: "Feature completata",
  },
  refactoring: {
    prefix: "Refactoring",
    label: "refactoring",
    success: "Refactoring completato",
  },
  first: {
    prefix: "First Commit",
    label: "first",
    success: "Primo commit e push completati",
  },
  default: {
    prefix: "Automatic Commit",
    label: "commit",
    success: "Commit completato",
  },
};

const DEFAULT_MESSAGE = "General Edits on Current Branch";

function getArgs() {
  const [type, ...rest] = process.argv.slice(2);
  const message = rest.join(" ").trim() || DEFAULT_MESSAGE;
  return { type, message };
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

function printHeader(config) {
  console.log();
  console.log(chalk.cyan(PROMPT) + " " + chalk.bold(config.label));
  console.log();
}

function printSuccess(config, message, branch, extra = null) {
  console.log(chalk.green("✓") + " " + chalk.bold(config.success));
  console.log(chalk.dim("  branch  ") + branch);
  console.log(chalk.dim("  message ") + message);
  if (extra) console.log(chalk.dim("  remote  ") + extra);
  console.log();
}

function printError(errMessage) {
  console.error(chalk.red("✗") + " " + chalk.bold("commit fallito"));
  console.error(chalk.dim("  " + (errMessage || "")));
  console.error();
}

async function doAddCommitPush(prefix, message, branch) {
  const spinAdd = ora({ text: chalk.dim("aggiunta file allo staging"), color: "cyan" }).start();
  await git.add(".");
  spinAdd.succeed(chalk.dim("staging"));

  const spinCommit = ora({ text: chalk.dim("creazione commit"), color: "cyan" }).start();
  await git.commit(`${prefix}: ${message}`);
  spinCommit.succeed(chalk.dim("commit"));

  const spinPush = ora({ text: chalk.dim("push origin"), color: "cyan" }).start();
  await git.push("origin", branch);
  spinPush.succeed(chalk.dim("push"));
}

async function runFirstCommit(remoteUrl) {
  if (!remoteUrl) {
    throw new Error('Per "first" serve l\'URL del remote: commit first "https://github.com/user/repo.git"');
  }

  const spinInit = ora({ text: chalk.dim("init repo"), color: "cyan" }).start();
  await git.init(".");
  spinInit.succeed(chalk.dim("init"));

  const spinAdd = ora({ text: chalk.dim("staging"), color: "cyan" }).start();
  await git.add(".");
  spinAdd.succeed(chalk.dim("staging"));

  const spinCommit = ora({ text: chalk.dim("primo commit"), color: "cyan" }).start();
  await git.commit(COMMIT_TYPES.first.prefix);
  spinCommit.succeed(chalk.dim("commit"));

  const spinBranch = ora({ text: chalk.dim("branch main"), color: "cyan" }).start();
  await git.raw(["branch", "-m", "main"]);
  spinBranch.succeed(chalk.dim("main"));

  const spinRemote = ora({ text: chalk.dim("remote origin"), color: "cyan" }).start();
  await git.addRemote("origin", remoteUrl);
  spinRemote.succeed(chalk.dim("origin"));

  const spinPush = ora({ text: chalk.dim("push"), color: "cyan" }).start();
  await git.push(["-u", "origin", "main"]);
  spinPush.succeed(chalk.dim("push"));

  printSuccess(COMMIT_TYPES.first, "Primo commit", "main", remoteUrl);
}

async function runNormalCommit(config, message, branch) {
  printHeader(config);
  await doAddCommitPush(config.prefix, message, branch);
  printSuccess(config, `${config.prefix}: ${message}`, branch);
}

async function main() {
  const { type, message } = getArgs();
  const config = COMMIT_TYPES[type] || COMMIT_TYPES.default;

  if (type === "first") {
    printHeader(config);
    await runFirstCommit(message);
    return;
  }

  const repo = await isRepo();
  if (!repo) {
    throw new Error("Non sei in una repository Git. Esegui 'git init' o usa 'commit first \"url-remote\"' per il primo commit.");
  }

  const branch = await getCurrentBranch();
  await runNormalCommit(config, message, branch);
}

main().catch((err) => {
  console.log();
  printError(err.message || err);
  process.exit(1);
});
