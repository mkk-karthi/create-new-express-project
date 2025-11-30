const totalSteps = 4;
let currentStep = 0;
let lastStep = null;
let spinnerInterval = null;
const tickIcon = "\x1b[32m✔\x1b[0m";
const spinnerFrames = ["|", "/", "-", "\\"];

export const updateProgressBar = (stepName) => {
  currentStep++;
  if (spinnerInterval) clearInterval(spinnerInterval);

  if (lastStep) {
    // Move cursor up one line
    process.stdout.write("\x1b[1A"); // Move up
    process.stdout.write("\x1b[2K"); // Clear the entire line
    process.stdout.write(`${tickIcon} ${lastStep}\n`);
  }

  if (totalSteps == currentStep) {
    process.stdout.write(`${tickIcon} ${stepName}\n`);
  } else {
    lastStep = stepName;
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
