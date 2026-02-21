import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const cursorSkillsDir = path.join(repoRoot, '.cursor', 'skills');
const aiSkillsDir = path.join(repoRoot, '.ai', 'skills');
const outputJson = path.join(aiSkillsDir, 'index.json');
const outputMd = path.join(aiSkillsDir, 'index.md');

function parseFrontMatter(text) {
  if (!text.startsWith('---')) {
    return {};
  }

  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    return {};
  }

  const block = text.slice(3, end).trim();
  const meta = {};

  for (const line of block.split(/\r?\n/)) {
    const splitIndex = line.indexOf(':');
    if (splitIndex <= 0) continue;
    const key = line.slice(0, splitIndex).trim();
    const value = line.slice(splitIndex + 1).trim();
    meta[key] = value;
  }

  return meta;
}

if (!fs.existsSync(cursorSkillsDir)) {
  console.error('❌ 缺少目录: .cursor/skills');
  process.exit(1);
}

fs.mkdirSync(aiSkillsDir, { recursive: true });

const entries = fs.readdirSync(cursorSkillsDir, { withFileTypes: true });
const dirs = entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();

const items = dirs.map((dirName) => {
  const skillFile = path.join(cursorSkillsDir, dirName, 'SKILL.md');
  let name = dirName;
  let description = '';

  if (fs.existsSync(skillFile)) {
    const content = fs.readFileSync(skillFile, 'utf8');
    const meta = parseFrontMatter(content);
    if (typeof meta.name === 'string' && meta.name.trim()) {
      name = meta.name.trim();
    }
    if (typeof meta.description === 'string' && meta.description.trim()) {
      description = meta.description.trim();
    }
  }

  return {
    id: dirName,
    name,
    description,
    source: `.cursor/skills/${dirName}/SKILL.md`,
  };
});

fs.writeFileSync(outputJson, `${JSON.stringify({ generatedAt: new Date().toISOString(), count: items.length, items }, null, 2)}\n`, 'utf8');

const mdLines = [
  '# Skills Index (generated)',
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
  `Total: ${items.length}`,
  '',
];

for (const item of items) {
  mdLines.push(`- ${item.id}: ${item.description || '(no description)'}`);
}

mdLines.push('');
fs.writeFileSync(outputMd, mdLines.join('\n'), 'utf8');

console.log(`✅ 已生成: ${path.relative(repoRoot, outputJson).replace(/\\/g, '/')}`);
console.log(`✅ 已生成: ${path.relative(repoRoot, outputMd).replace(/\\/g, '/')}`);
