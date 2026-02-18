#!/usr/bin/env node
import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";
import simpleGit from "simple-git";

const git = simpleGit();

const COMMIT_TYPES = {
  fix: {
    prefix: "🛠 Fix",
    preparing: "🛠 Fix",
    success: "Fix completato",
  },
  feat: {
    prefix: "✅ Feat",
    preparing: "✅ Feat",
    success: "Feature completata",
  },
  refactoring: {
    prefix: "✏️ Refactoring",
    preparing: "✏️ Refactoring",
    success: "Refactoring completato",
  },
  first: {
    prefix: "🚀 First Commit",
    preparing: "🚀 First Commit",
    success: "Primo commit e push completati",
  },
  default: {
    prefix: "🤖 Automatic Commit",
    preparing: "🤖 Auto",
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
  console.log(chalk.bold.cyan("  ◆ ") + chalk.bold(config.preparing));
  console.log(chalk.dim("  ─────────────────────────"));
  console.log();
}

function printSuccessBox(config, message, branch, extra = null) {
  const lines = [
    chalk.green("✓ ") + chalk.bold(config.success),
    "",
    chalk.dim("Branch:  ") + branch,
    chalk.dim("Message: ") + message,
  ];
  if (extra) lines.push(chalk.dim("Remote:  ") + extra);
  const box = boxen(lines.join("\n"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
    dimBorder: true,
  });
  console.log(box);
}

function printErrorBox(errMessage) {
  const content = chalk.red("✗ ") + chalk.bold("Commit fallito") + "\n\n" + chalk.dim(errMessage);
  const box = boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "red",
    dimBorder: true,
  });
  console.error(box);
}

async function doAddCommitPush(prefix, message, branch) {
  const spinAdd = ora({ text: "Aggiunta file allo staging...", color: "yellow" }).start();
  await git.add(".");
  spinAdd.succeed("File aggiunti allo staging");

  const spinCommit = ora({ text: "Creazione commit...", color: "yellow" }).start();
  await git.commit(`${prefix}: ${message}`);
  spinCommit.succeed("Commit creato");

  const spinPush = ora({ text: "Push su origin...", color: "yellow" }).start();
  await git.push("origin", branch);
  spinPush.succeed("Push completato");
}

async function runFirstCommit(remoteUrl) {
  if (!remoteUrl) {
    throw new Error('Per "first" serve l\'URL del remote: commit first "https://github.com/user/repo.git"');
  }

  const spinInit = ora({ text: "Inizializzazione repository...", color: "blue" }).start();
  await git.init(".");
  spinInit.succeed("Repository inizializzata");

  const spinAdd = ora({ text: "Aggiunta file allo staging...", color: "yellow" }).start();
  await git.add(".");
  spinAdd.succeed("File aggiunti allo staging");

  const spinCommit = ora({ text: "Primo commit...", color: "yellow" }).start();
  await git.commit(COMMIT_TYPES.first.prefix);
  spinCommit.succeed("Commit creato");

  const spinBranch = ora({ text: "Branch rinominato in main...", color: "yellow" }).start();
  await git.raw(["branch", "-m", "main"]);
  spinBranch.succeed("Branch main");

  const spinRemote = ora({ text: "Connessione al remote...", color: "yellow" }).start();
  await git.addRemote("origin", remoteUrl);
  spinRemote.succeed("Remote origin configurato");

  const spinPush = ora({ text: "Push su origin/main...", color: "yellow" }).start();
  await git.push(["-u", "origin", "main"]);
  spinPush.succeed("Push completato");

  printSuccessBox(COMMIT_TYPES.first, "Primo commit", "main", remoteUrl);
}

async function runNormalCommit(config, message, branch) {
  printHeader(config);
  await doAddCommitPush(config.prefix, message, branch);
  console.log();
  printSuccessBox(config, `${config.prefix}: ${message}`, branch);
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
  printErrorBox(err.message || err);
  process.exit(1);
});
