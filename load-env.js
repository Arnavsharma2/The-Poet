// Simple script to load .env file and export variables
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envPath = path.join(__dirname, '.env');
const envVars = { ...process.env };

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value.trim();
      }
    }
  });
}

// Get the command and args (everything after this script)
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

// Spawn the command with the environment variables
const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  shell: true,
  env: envVars
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

