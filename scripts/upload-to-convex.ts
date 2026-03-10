import { ConvexClient } from "convex/browser";
import * as fs from "fs";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

// This pulls your URL from the .env.local file I saw in your screenshot
dotenv.config({ path: "../.env.local" });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is missing in .env.local");
}

const client = new ConvexClient(convexUrl);

async function main() {
  // Points to the data folder shown in your explorer
  const dataPath = "./data/programs.json"; 
  
  if (!fs.existsSync(dataPath)) {
    console.error("❌ File not found at ./data/programs.json");
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.log(`🚀 Sending ${data.length} programs to ${convexUrl}...`);

  try {
    // Stage 1: upsert raw programs with semantic metadata
    await client.mutation(api.programs.uploadPrograms, { programs: data });

    // Stage 2: create embeddings/chunks and mark programs as ingested
    const result = await client.action(api.ragIngestion.ingestAllPrograms, {
      batchSize: 20,
    });

    console.log("✅ Success! Programs uploaded and ingested.");
    console.log(result);
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
}

main();