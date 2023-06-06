#!/usr/bin/env node
import chalk from "chalk";
import simpleGit from "simple-git";

const git = simpleGit();

async function autoCommitFunc() {
  const message =
    process.argv.slice(3).join(" ") || "General Edits on Current Branch";
  let messagePrefix;
  let consoleMessage;
  let isFirstCommit = false;

  switch (process.argv.slice(2)[0]) {
    case "fix":
      messagePrefix = "🛠 Fix";
      consoleMessage = "🛠 Fixing Commit Successful";
      break;
    case "feat":
      messagePrefix = "✅ Feat";
      consoleMessage = "✅ Featuring Commit Successful";
      break;
    case "refactoring":
      messagePrefix = "✏️ Refactoring";
      consoleMessage = "✏️ Refactoring Commit Successful";
      break;
    case "first":
      messagePrefix = "🚀 First Commit";
      consoleMessage = "🚀 First Commit Successful";
      isFirstCommit = true;
      await git.init(".");
      await git.add(".");
      await git.commit(`${messagePrefix}`);
      await git.raw(["branch", "-m", "main"]);
      await git.addRemote("origin",`${message}`);
      await git.push(["-u", "origin", "main"]);
      console.log(chalk.green(consoleMessage));
      console.log("message is: ",message);
      break;
    default:
      messagePrefix = "🤖 Automatic Commit";
      consoleMessage = "🤖 Automaitc Commit Successful";
  }

  if( !isFirstCommit) {
    await git.add(".");
    await git.commit(`${messagePrefix}: ${message}`);
    await git.push("origin", "main");
    console.log(chalk.green(consoleMessage));
  }
}

try {
  autoCommitFunc().catch(err => console.log(chalk.red("Failed to Commit", err)));
} catch (error) {
  console.log(error);
}
