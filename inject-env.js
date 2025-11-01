// Script to inject .env values into environment files before build
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let apiKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0 && key.trim() === 'NG_APP_GEMINI_API_KEY') {
        apiKey = valueParts.join('=').replace(/^["']|["']$/g, '').trim();
      }
    }
  });
}

// Update environment files
const envFiles = [
  'src/environments/environment.ts',
  'src/environments/environment.development.ts',
  'src/environments/environment.prod.ts'
];

envFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Escape single quotes in the API key
    const escapedKey = apiKey.replace(/'/g, "\\'");
    // Replace the geminiApiKey value (handles both empty string and any existing value)
    content = content.replace(
      /geminiApiKey:\s*(['"][^'"]*['"]|['"]\s*['"])/g,
      `geminiApiKey: '${escapedKey}'`
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

