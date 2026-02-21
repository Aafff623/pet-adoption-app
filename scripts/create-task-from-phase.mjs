import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const [, , phaseDocArg, featureSlugArg, maybeDryRun] = process.argv;
const dryRun = maybeDryRun === '--dry-run' || featureSlugArg === '--dry-run';
const featureSlug = featureSlugArg === '--dry-run' ? '' : (featureSlugArg || 'task');

if (!phaseDocArg) {
  console.error('Usage: node scripts/create-task-from-phase.mjs <phase-doc-path> [feature-slug] [--dry-run]');
  process.exit(1);
}

const phaseDocPath = path.resolve(repoRoot, phaseDocArg);
if (!fs.existsSync(phaseDocPath)) {
  console.error(`❌ 文件不存在: ${phaseDocArg}`);
  process.exit(1);
}

const fileName = path.basename(phaseDocPath);
const phaseMatch = fileName.match(/phase-(\d+)/i);
const phasePart = phaseMatch ? `phase${phaseMatch[1]}` : 'phaseX';

const today = new Date();
const yyyy = String(today.getFullYear());
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const datePart = `${yyyy}-${mm}-${dd}`;

const normalizedSlug = featureSlug
  .toLowerCase()
  .replace(/[^a-z0-9\-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '') || 'task';

const taskDirName = `${datePart}-${phasePart}-${normalizedSlug}`;
const taskDir = path.join(repoRoot, 'tasks', taskDirName);

if (fs.existsSync(taskDir)) {
  console.error(`❌ 任务目录已存在: tasks/${taskDirName}`);
  process.exit(1);
}

const specPath = path.join(taskDir, 'spec.md');
const donePath = path.join(taskDir, 'done.md');
const demandRel = path.relative(repoRoot, phaseDocPath).replace(/\\/g, '/');

const specContent = `# Spec\n\n## Goal\n\n- 基于 ${demandRel} 完成 ${normalizedSlug} 对应交付。\n\n## Acceptance Criteria\n\n- [ ] 验收标准 1\n- [ ] 验收标准 2\n- [ ] 验收标准 3\n\n## Scope\n\n- In scope:\n  - \n- Out of scope:\n  - \n\n## API/DB Touch\n\n- API 变更：\n- DB 变更（migration / table / policy）：\n\n## Linked Demand Doc\n\n- 关联需求文档：${demandRel}\n`;

const doneContent = `# Done\n\n## What changed\n\n- 已完成内容概述：\n\n## Files touched\n\n- \n\n## Test checklist\n\n- [ ] 本地功能验证\n- [ ] 关键路径回归\n- [ ] 异常场景验证\n\n## Build result\n\n- \`npm run build\`：\n\n## Preview/Prod links\n\n- Preview:\n- Production:\n`;

if (dryRun) {
  console.log(`DRY RUN ✅ 将创建: tasks/${taskDirName}`);
  console.log(`- tasks/${taskDirName}/spec.md`);
  console.log(`- tasks/${taskDirName}/done.md`);
  process.exit(0);
}

fs.mkdirSync(taskDir, { recursive: true });
fs.writeFileSync(specPath, specContent, 'utf8');
fs.writeFileSync(donePath, doneContent, 'utf8');

console.log(`✅ 已创建: tasks/${taskDirName}`);
console.log(`- tasks/${taskDirName}/spec.md`);
console.log(`- tasks/${taskDirName}/done.md`);
