import fs from "fs";
let lastStepName = null;
let spinnerInterval = null;
const tickIcon = "\x1b[32m✔\x1b[0m";
const spinnerFrames = ["|", "/", "-", "\\"];

export const updateProgressBar = (stepName, lastStep = false) => {
  if (spinnerInterval) clearInterval(spinnerInterval);

  if (lastStepName) {
    // Move cursor up one line
    process.stdout.write("\x1b[1A"); // Move up
    process.stdout.write("\x1b[2K"); // Clear the entire line
    process.stdout.write(`${tickIcon} ${lastStepName}\n`);
  }

  if (lastStep) {
    process.stdout.write(`${tickIcon} ${stepName}\n`);
  } else {
    lastStepName = stepName;
    let spinnerIndex = 0;
    process.stdout.write(`${spinnerFrames[0]} ${stepName}\n`);
    spinnerInterval = setInterval(() => {
      // Move up and clear line
      process.stdout.write("\x1b[1A");
      process.stdout.write("\x1b[2K");

      // Show the spinner with the current step
      const spinner = spinnerFrames[spinnerIndex % spinnerFrames.length];
      process.stdout.write(`${spinner} ${stepName}\n`);
      spinnerIndex++;
    }, 100);
  }
};

export const generateFolderName = (projectName) => {
  let folderName = projectName
    .replaceAll(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .replaceAll(" ", "_");
  projectName = folderName;
  let i = 0;

  // check project folder is already exist
  while (fs.existsSync(folderName)) {
    i++;
    folderName = `${projectName}_${i}`;
  }
  return folderName;
};
