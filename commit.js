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
      console.log(chalk.blue(`🛠 Preparing to Fix...`))
      messagePrefix = "🛠 Fix";
      consoleMessage = "🛠 Fixing Commit Successful";
      break;
    case "feat":
      console.log(chalk.blue(`✅ Preparing to Commit New Feature...`))
      messagePrefix = "✅ Feat";
      consoleMessage = "✅ Featuring Commit Successful";
      break;
    case "refactoring":
      console.log(chalk.blue(`✏️ Preparing to Refactoring...`))
      messagePrefix = "✏️ Refactoring";
      consoleMessage = "✏️ Refactoring Commit Successful";
      break;
    case "first":
      console.log(chalk.blue(`🚀 Preparing to First Commit...`))
      messagePrefix = "🚀 First Commit";
      consoleMessage = "🚀 First Commit Successful";
      isFirstCommit = true;
      await git.init(".").then(console.log(chalk.blue("🎬 Init of git in the folder...")));
      await git.add(".").then(console.log(chalk.yellow("🚧 Adding all files to git staging...")));
      await git.commit(`${messagePrefix}`);
      await git.raw(["branch", "-m", "main"]);
      console.log(chalk.yellow(`🏗 Connection to git repository - [${message}"]...`));
      await git.addRemote('origin',`${message}`);
      console.log(chalk.yellow(`🏗 Preparing to push...`));
      await git.push(["-u", "origin", "main"]);
      console.log(chalk.green(consoleMessage));
      break;
    default:
      console.log(chalk.blue(`⚙️ Preparing Automatic Commit...`))
      messagePrefix = "🤖 Automatic Commit";
      consoleMessage = "🤖 Automaitc Commit Successful";
  }

  if( !isFirstCommit) {
    console.log(chalk.yellow(`🚧 Adding all files to git staging...`))
    await git.add(".");
    await git.commit(`${messagePrefix}: ${message}`).then(console.log(chalk.yellow(`🏗  Preparing to push...`)));
    await git.push("origin", "main");
    console.log(chalk.green(consoleMessage));
  }
}

try {
  autoCommitFunc().catch(err => console.log(chalk.red("Failed to Commit", err)));
} catch (error) {
  console.log(error);
}
