// upload-programs-script.js
// Run this with: node upload-programs-script.js

const fs = require('fs');
const path = require('path');

// Read .env.local file to get CONVEX_URL
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local file not found!');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}

async function uploadPrograms() {
  console.log('🚀 Starting program upload...\n');

  // Load environment variables
  loadEnvFile();

  // Load the programs
  const programsPath = './FINAL_106_PROGRAMS_WITH_GRADES.json';
  
  if (!fs.existsSync(programsPath)) {
    console.error('❌ Error: FINAL_106_PROGRAMS_WITH_GRADES.json not found!');
    console.error('   Please copy it to your project root directory.');
    process.exit(1);
  }

  const programs = JSON.parse(fs.readFileSync(programsPath, 'utf8'));
  console.log(`📊 Loaded ${programs.length} programs\n`);

  // Import Convex client
  let ConvexHttpClient;
  try {
    const convex = await import('convex/browser');
    ConvexHttpClient = convex.ConvexHttpClient;
  } catch (error) {
    console.error('❌ Error: Could not import Convex client');
    console.error('   Make sure you\'re in your APAS project directory');
    console.error('   and have run: npm install');
    process.exit(1);
  }

  // Get deployment URL from environment
  const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  
  if (!deploymentUrl) {
    console.error('❌ Error: CONVEX_URL not found in .env.local!');
    console.error('   Current .env.local content:');
    console.error('   ', fs.readFileSync('.env.local', 'utf8').split('\n').slice(0, 5).join('\n    '));
    process.exit(1);
  }

  console.log(`🔗 Connecting to: ${deploymentUrl}\n`);
  const client = new ConvexHttpClient(deploymentUrl);

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];
    
    try {
      const result = await client.mutation('uploadPrograms:addProgram', program);
      
      if (result.success) {
        added++;
        console.log(`✓ [${i + 1}/${programs.length}] Added: ${program.name}`);
      } else {
        skipped++;
        console.log(`⊘ [${i + 1}/${programs.length}] Skipped (exists): ${program.name}`);
      }
    } catch (error) {
      errors++;
      console.error(`✗ [${i + 1}/${programs.length}] Error: ${program.name}`);
      console.error(`  ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Complete!');
  console.log('='.repeat(60));
  console.log(`✓ Added: ${added}`);
  console.log(`⊘ Skipped: ${skipped}`);
  console.log(`✗ Errors: ${errors}`);
  console.log(`📁 Total: ${programs.length}`);
  console.log('='.repeat(60) + '\n');

  process.exit(0);
}

uploadPrograms().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});