const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPOS = [
  { name: 'freobus-deploy', path: 'freobus-deploy' },
  { name: 'freobus-extension', path: 'freobus-extension' },
  { name: 'current', path: '.' }
];

function searchInRepo(repo, query) {
  try {
    const command = `cd ${repo.path} && git grep -i "${query}" -- "*.ts" "*.tsx" "*.js" "*.jsx" "*.json" "*.md"`;
    const output = execSync(command, { encoding: 'utf8' });
    return output.split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

function searchAll(query) {
  console.log(`Searching for: "${query}"\n`);
  
  REPOS.forEach(repo => {
    console.log(`\nResults in ${repo.name}:`);
    const results = searchInRepo(repo, query);
    
    if (results.length === 0) {
      console.log('No matches found');
    } else {
      results.forEach(result => {
        console.log(result);
      });
    }
  });
}

// Get search query from command line argument
const query = process.argv[2];
if (!query) {
  console.log('Please provide a search query');
  process.exit(1);
}

searchAll(query); 