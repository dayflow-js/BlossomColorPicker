#!/usr/bin/env node
/**
 * Release preflight for publish.sh. Catches the mistakes that only show up
 * after a package is on npm: a wrapper asking for a core version that does not
 * exist, an Angular manifest that still says `workspace:`, a missing entry file.
 *
 *   node scripts/check-release.mjs                 # manifests only (before build)
 *   node scripts/check-release.mjs --dist          # also check the built output
 *   node scripts/check-release.mjs --mode angular  # only what `publish.sh angular` ships
 *   node scripts/check-release.mjs --offline       # skip npm registry lookups
 *
 * Exits with 1 when it finds an error, so publish.sh can stop before publishing.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CORE = '@dayflow/blossom-color-picker';

const argv = process.argv.slice(2);
const CHECK_DIST = argv.includes('--dist');
const OFFLINE = argv.includes('--offline');
const MODE = argv.includes('--mode') ? argv[argv.indexOf('--mode') + 1] : 'all';

/** Mirrors the package groups in publish.sh. Angular ships from its dist/. */
const PACKAGES = [
  { dir: 'core', modes: ['all', 'main'] },
  { dir: 'react', modes: ['all', 'main'] },
  { dir: 'vue', modes: ['all', 'main'] },
  { dir: 'svelte', modes: ['all', 'main'] },
  { dir: 'angular', modes: ['all', 'angular'], publishDir: 'dist' },
];

const errors = [];
const warnings = [];
const error = msg => errors.push(msg);
const warn = msg => warnings.push(msg);

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/;
const parse = v => SEMVER.exec(v)?.slice(1, 4).map(Number) ?? null;
const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** The ranges this repo uses: exact, ^, ~ and >=. */
function satisfies(version, range) {
  const v = parse(version);
  const op = /^(\^|~|>=)?/.exec(range)[1] ?? '';
  const base = parse(range.slice(op.length));
  if (!v || !base) return false;
  if (op === '>=') return compare(v, base) >= 0;
  if (op === '') return compare(v, base) === 0;
  if (compare(v, base) < 0) return false;
  if (op === '~') return v[0] === base[0] && v[1] === base[1];
  // ^: the left-most non-zero part must match.
  if (base[0] > 0) return v[0] === base[0];
  if (base[1] > 0) return v[0] === 0 && v[1] === base[1];
  return compare(v, base) === 0;
}

const published = new Map();
/** Whether name@version is on npm; `null` when that could not be checked. */
function isPublished(name, version) {
  if (OFFLINE) return null;
  const key = `${name}@${version}`;
  if (!published.has(key)) {
    try {
      const out = execFileSync('npm', ['view', key, 'version'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      published.set(key, out.trim() === version);
    } catch {
      published.set(key, false);
    }
  }
  return published.get(key);
}

/** Every file path a manifest points at (entry fields and string exports). */
function entryPaths(manifest) {
  const paths = [manifest.main, manifest.module, manifest.types];
  const walk = node => {
    if (typeof node === 'string') paths.push(node);
    else if (node && typeof node === 'object')
      Object.values(node).forEach(walk);
  };
  walk(manifest.exports);
  return paths.filter(Boolean);
}

const pkgs = PACKAGES.map(p => {
  const dir = path.join(ROOT, 'packages', p.dir);
  return { ...p, dir, manifest: readJson(path.join(dir, 'package.json')) };
});
const core = pkgs.find(p => p.manifest.name === CORE);
const coreVersion = core.manifest.version;
const shipping = pkgs.filter(p => p.modes.includes(MODE));
const coreShips = shipping.includes(core);

if (!shipping.length) {
  error(`Unknown mode "${MODE}". Use all, main or angular.`);
}

// CI installs with --frozen-lockfile, so a version bump that changed a range
// without updating pnpm-lock.yaml breaks the build after the release commit.
if (!CHECK_DIST) {
  try {
    execFileSync('pnpm', ['install', '--frozen-lockfile', '--lockfile-only'], {
      cwd: ROOT,
      stdio: 'ignore',
    });
  } catch {
    error(
      'pnpm-lock.yaml is out of date with the package manifests. ' +
        'Run `pnpm install` and commit the lockfile.'
    );
  }
}

for (const pkg of shipping) {
  const { name, version } = pkg.manifest;

  if (!parse(version)) error(`${name}: "${version}" is not a valid version.`);
  if (isPublished(name, version)) {
    warn(`${name}@${version} is already on npm and will be skipped.`);
  }

  // Wrappers must ask for a core version that exists once this release is out.
  const range = pkg.manifest.dependencies?.[CORE];
  if (range && !range.startsWith('workspace:')) {
    if (!satisfies(coreVersion, range)) {
      error(
        `${name} depends on ${CORE}@${range}, but core is ${coreVersion}. ` +
          'Re-run the version bump so the ranges stay in sync.'
      );
    } else if (!coreShips && isPublished(CORE, coreVersion) === false) {
      error(
        `${name} needs ${CORE}@${coreVersion}, which is not on npm and is not ` +
          `part of "publish.sh ${MODE}". Publish core first (publish.sh main).`
      );
    }
  }

  if (!CHECK_DIST) continue;

  const publishDir = path.join(pkg.dir, pkg.publishDir ?? '');
  const shipped = pkg.publishDir
    ? readJsonIfExists(path.join(publishDir, 'package.json'))
    : pkg.manifest;
  if (!shipped) {
    error(
      `${name}: ${path.relative(ROOT, publishDir)}/package.json is missing. Build it first.`
    );
    continue;
  }

  if (pkg.publishDir) {
    // ng-packagr copies the source manifest; npm publishes it untouched.
    const raw = fs.readFileSync(path.join(publishDir, 'package.json'), 'utf8');
    if (/"(workspace|catalog):/.test(raw)) {
      error(
        `${name}: dist/package.json still has a workspace: or catalog: range.`
      );
    }
    if (shipped.version !== version) {
      error(
        `${name}: dist/package.json is ${shipped.version}, source is ${version}. Rebuild.`
      );
    }
  }

  for (const entry of entryPaths(shipped)) {
    if (!fs.existsSync(path.join(publishDir, entry))) {
      error(`${name}: "${entry}" is listed in package.json but was not built.`);
    }
  }
  for (const file of shipped.files ?? []) {
    if (!/[*?]/.test(file) && !fs.existsSync(path.join(publishDir, file))) {
      error(`${name}: "${file}" is listed in "files" but does not exist.`);
    }
  }
}

function readJsonIfExists(file) {
  return fs.existsSync(file) ? readJson(file) : null;
}

const label = CHECK_DIST ? 'built packages' : 'manifests';
for (const msg of warnings) console.log(`  \x1b[33m⚠ ${msg}\x1b[0m`);
for (const msg of errors) console.log(`  \x1b[31m✗ ${msg}\x1b[0m`);
if (errors.length) {
  console.log(`\x1b[31mRelease preflight failed for ${label}.\x1b[0m`);
  process.exit(1);
}
console.log(
  `  \x1b[32m✓ Release preflight passed for ${label} (${MODE})\x1b[0m`
);
