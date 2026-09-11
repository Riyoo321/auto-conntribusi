const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const commitsPerDayMin = 1;
const commitsPerDayMax = 5;
const skipWeekends = false; // Set to true if you want to look more natural

// Set start date to Jan 1, 2024
const startDate = new Date('2024-01-01T09:00:00');
const endDate = new Date();

// Create contributions.txt at the current script location
const filePath = path.join(__dirname, 'contributions.txt');

console.log("Generating backdated commits...");

let currentDate = new Date(startDate);
let totalCommits = 0;

// Ensure we have a file to write to
fs.writeFileSync(filePath, "GitHub contribution logs\n");

while (currentDate <= endDate) {
  const dayOfWeek = currentDate.getDay();
  // Check if it's weekend
  if (skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
    currentDate.setDate(currentDate.getDate() + 1);
    continue;
  }

  // Random number of commits for this day
  const numCommits = Math.floor(Math.random() * (commitsPerDayMax - commitsPerDayMin + 1)) + commitsPerDayMin;

  for (let i = 0; i < numCommits; i++) {
    // Generate random hour/minute/second
    const hours = String(Math.floor(Math.random() * 8) + 9).padStart(2, '0'); // 9 AM to 5 PM
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const seconds = String(Math.floor(Math.random() * 60)).padStart(2, '0');

    // Format ISO string with the date and random time
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    // Append to file
    fs.appendFileSync(filePath, `Commit on ${dateString}\n`);

    // Commit with backdated date
    try {
      execSync(`git add "${filePath}"`, { stdio: 'ignore' });
      // Set environment variables for the specific commit
      const env = {
        ...process.env,
        GIT_AUTHOR_DATE: dateString,
        GIT_COMMITTER_DATE: dateString
      };
      execSync(`git commit -m "chore: contribution daily update ${totalCommits + 1}"`, { env, stdio: 'ignore' });
      totalCommits++;
    } catch (err) {
      console.error("Failed to commit on date:", dateString, err.message);
    }
  }

  // Move to next day
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log(`Successfully generated ${totalCommits} backdated commits!`);
console.log("\n💡 PUSH INSTRUCTION:");
console.log("Run the following command to push all commits to GitHub:");
console.log("git push origin main --force");
