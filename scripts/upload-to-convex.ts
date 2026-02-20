import { ConvexClient } from "convex/browser";
import * as fs from "fs";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

// This pulls your URL from the .env.local file I saw in your screenshot
dotenv.config({ path: "../.env.local" });

const client = new ConvexClient("https://marvelous-stingray-639.convex.cloud");

async function main() {
  // Points to the data folder shown in your explorer
  const dataPath = "./data/programs.json"; 
  
  if (!fs.existsSync(dataPath)) {
    console.error("❌ File not found at ./data/programs.json");
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.log(`🚀 Sending ${data.length} programs to marvelous-stingray-639...`);

  try {
    // This calls the upload function in your convex/programs.ts file
    await client.mutation(api.programs.uploadPrograms, { programs: data });
    console.log("✅ Success! Check the 'Data' tab in your Convex dashboard.");
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
}

main();