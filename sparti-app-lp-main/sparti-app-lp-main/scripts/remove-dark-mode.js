// Script to remove all dark mode classes from components
const fs = require('fs');
const path = require('path');

function removeDarkModeClasses(content) {
  // Remove all dark mode classes while preserving the light mode classes
  return content
    .replace(/\s+dark:[a-zA-Z0-9\-\/\[\]\.%:]+/g, '')
    .replace(/className="([^"]*)\s+"/g, 'className="$1"')
    .replace(/className="\s+/g, 'className="')
    .replace(/\s+"/g, '"');
}

// Process AISEOEnhancer.tsx
const aiseoPath = path.join(__dirname, '../src/components/AISEOEnhancer.tsx');
if (fs.existsSync(aiseoPath)) {
  const content = fs.readFileSync(aiseoPath, 'utf8');
  const cleanedContent = removeDarkModeClasses(content);
  fs.writeFileSync(aiseoPath, cleanedContent);
  console.log('Cleaned AISEOEnhancer.tsx');
}

console.log('Dark mode removal complete!');