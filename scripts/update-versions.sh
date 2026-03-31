#!/bin/bash

# Find all package.json files inside packages/, excluding node_modules
PACKAGE_FILES=$(find packages -name "package.json" -not -path "*/node_modules/*")
CORE_PKG_NAME="@dayflow/blossom-color-picker"

if [ -z "$PACKAGE_FILES" ]; then
  echo "No package.json files found in packages/."
  exit 0
fi

# Use Node.js for the interactive menu
BUMP_TYPE=$(node -e '
const readline = require("readline");
const { stdin, stderr } = process;

const options = ["PATCH", "MINOR", "MAJOR"];
let index = 0;

stderr.write("\n".repeat(options.length + 1));

function render() {
  readline.moveCursor(stderr, 0, -(options.length + 1));
  readline.clearScreenDown(stderr);
  
  stderr.write("Select version bump type for ALL packages (Use arrow keys, Enter to select):\n");
  options.forEach((opt, i) => {
    if (i === index) {
      stderr.write(`\x1b[36m> ${opt}\x1b[0m\n`);
    } else {
      stderr.write(`  ${opt}\n`);
    }
  });
}

readline.emitKeypressEvents(stdin);
if (stdin.isTTY) stdin.setRawMode(true);

render();

stdin.on("keypress", (str, key) => {
  if (!key) return;
  if (key.ctrl && key.name === "c") process.exit(1);
  else if (key.name === "up") { index = (index - 1 + options.length) % options.length; render(); }
  else if (key.name === "down") { index = (index + 1) % options.length; render(); }
  else if (key.name === "return") {
    if (stdin.isTTY) stdin.setRawMode(false);
    console.log(options[index]);
    process.exit(0);
  }
});
')

if [ $? -ne 0 ]; then
  echo "Operation cancelled."
  exit 1
fi

BUMP_TYPE=$(echo "$BUMP_TYPE" | xargs)

echo "Calculating new versions and syncing dependencies ($BUMP_TYPE)..."

# Use Node.js to perform the atomic update of all files to ensure core version is known
node -e '
const fs = require("fs");
const path = require("path");

const files = process.argv.slice(2);
const type = process.argv[1];
const coreName = "@dayflow/blossom-color-picker";

const pkgs = files.map(f => {
  const content = fs.readFileSync(f, "utf8");
  return { path: f, content: JSON.parse(content) };
});

function bump(version, type) {
  const parts = version.split(".").map(Number);
  if (type === "PATCH") parts[2]++;
  else if (type === "MINOR") { parts[1]++; parts[2] = 0; }
  else if (type === "MAJOR") { parts[0]++; parts[1] = 0; parts[2] = 0; }
  return parts.join(".");
}

// 1. Calculate all new versions
pkgs.forEach(p => {
  if (p.content.version) {
    p.oldVersion = p.content.version;
    p.newVersion = bump(p.oldVersion, type);
  }
});

const corePkg = pkgs.find(p => p.content.name === coreName);
const newCoreVersion = corePkg ? corePkg.newVersion : null;

// 2. Update and write back
pkgs.forEach(p => {
  if (p.newVersion) {
    p.content.version = p.newVersion;
    
    const updateDeps = (deps) => {
      if (deps && deps[coreName] && newCoreVersion) {
        deps[coreName] = `^${newCoreVersion}`;
        return true;
      }
      return false;
    };

    updateDeps(p.content.dependencies);
    updateDeps(p.content.peerDependencies);
    updateDeps(p.content.devDependencies);

    fs.writeFileSync(p.path, JSON.stringify(p.content, null, 2) + "\n");
    console.log(`Updated ${p.content.name || p.path}: ${p.oldVersion} -> ${p.newVersion}${p.content.name !== coreName && newCoreVersion ? " (Core synced)" : ""}`);
  }
});
' "$BUMP_TYPE" $PACKAGE_FILES

echo "All packages and dependencies updated successfully."
