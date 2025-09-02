import readline from "readline";
import { generateLinkedInPost } from "./geminiService.js";
import { postToLinkedIn } from "./linkedinPoster.js";
import dotenv from "dotenv";

dotenv.config();

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function run() {
  // Get input from user
  const topic = await askQuestion("👉 Enter the topic for your LinkedIn post: ");
  console.log("\n Topic : ", topic);

  console.log("\n✍️ Generating post...");
  const post = await generateLinkedInPost(topic);

  console.log("\n📄 Generated Post:\n");
  console.log(post);

  const confirm = await askQuestion("\n✅ Do you want to post this to LinkedIn? (yes/no): ");

  if (confirm.toLowerCase() === "yes") {
    await postToLinkedIn(post);
  } else {
    console.log("❌ Post cancelled.");
  }
}

run();
