const glob = require('glob');
const fs = require('fs');

// Function to extract class names from a file
const extractClassNames = (fileContent) => {
  const classNames = new Set();
  const regex = /class(Name)?="([^"]+)"/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    match[2].split(' ').forEach((className) => classNames.add(className));
  }
  return classNames;
};

// Function to list all class names in the project
const listClassNames = (pattern) => {
  const files = glob.sync(pattern);
  const allClassNames = new Set();
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const classNames = extractClassNames(content);
    classNames.forEach((className) => allClassNames.add(className));
  });
  return allClassNames;
};

// List all class names in the src directory
const classNames = listClassNames('./src/**/*.{js,jsx,html}');
const sortedClassNames = Array.from(classNames).sort();

// Write the class names to a file
fs.writeFileSync('classNames.txt', sortedClassNames.join('\n'), 'utf-8');
console.log('Class names have been written to classNames.txt');