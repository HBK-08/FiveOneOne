#!/usr/bin/env node
/**
 * init-character-json.js
 * SVTI 角色 JSON 模板初始化脚本
 *
 * 用法: node scripts/init-character-json.js [--force]
 *
 * 功能：
 * 1. 扫描 public/people/ 目录下的所有 .png 文件
 * 2. 为每个 .png 在 src/data/characters/ 生成对应的 JSON 模板
 * 3. 已存在的 JSON 文件默认跳过（使用 --force 可覆盖）
 * 4. 所有向量字段填充 null（需人工补充实际数值）
 *
 * 注意：此脚本只生成模板，不伪造人格向量数值。
 */

import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PEOPLE_DIR = join(ROOT, 'public', 'people')
const CHAR_DIR = join(ROOT, 'src', 'data', 'characters')

const force = process.argv.includes('--force')

// 已知可结婚角色（Stardew Valley 1.6）
const MARRIAGEABLE = new Set([
  'Abigail', 'Alex', 'Elliott', 'Emily', 'Haley', 'Harvey',
  'Leah', 'Maru', 'Penny', 'Sam', 'Sebastian', 'Shane', 'Krobus',
])

function toKebabCase(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[.']/g, '')
}

function toId(name) {
  return toKebabCase(name)
}

function buildTemplate(nameEn, avatarPath) {
  const id = toId(nameEn)
  return {
    id,
    nameZh: `【待填写：${nameEn} 的中文名】`,
    nameEn,
    avatar: avatarPath,
    introShort: `【待填写：${nameEn} 的简短介绍（1-2句话）】`,
    introLong: `【待填写：${nameEn} 的详细介绍（3-5句话）】`,
    tags: ['【待填写：标签1】', '【待填写：标签2】'],
    traitVector: {
      social: null,
      pace: null,
      emotion: null,
      value: null,
      natureTech: null,
      adventure: null,
      bonding: null,
      aesthetic: null,
    },
    romanceProfile: {
      stability: null,
      openness: null,
      independence: null,
      romance: null,
      adventure: null,
      domesticity: null,
      socialPresence: null,
      growthSupport: null,
    },
    partnerPreference: {
      preferredGender: ['any'],
      orientationMode: 'player_preference',
      weights: {
        social: 1.0,
        adventure: 1.0,
        bonding: 1.0,
      },
      hardFilters: {
        excludeIfOrientationMismatch: false,
      },
      conflictRules: [],
    },
    copy: {
      oneLiner: `【待填写：一句话结论，描述与 ${nameEn} 最像的用户特质】`,
      analysis: `【待填写：长文分析（3-5句）】`,
      getAlongAdvice: `【待填写：相处建议（2-4句）】`,
      conflictWarning: `【待填写：冲突预警（1-2句）】`,
      farmLifeAdvice: `【待填写：农场生活推荐（1-2句）】`,
    },
    meta: {
      marriageable: MARRIAGEABLE.has(nameEn),
      source: 'Stardew Valley 1.6',
      version: '1.0',
    },
  }
}

if (!existsSync(CHAR_DIR)) {
  mkdirSync(CHAR_DIR, { recursive: true })
  console.log(`📁 创建目录: ${CHAR_DIR}`)
}

if (!existsSync(PEOPLE_DIR)) {
  console.error(`❌ public/people/ 目录不存在: ${PEOPLE_DIR}`)
  process.exit(1)
}

const pngFiles = readdirSync(PEOPLE_DIR).filter(f => f.toLowerCase().endsWith('.png'))
if (pngFiles.length === 0) {
  console.warn('⚠️  public/people/ 中没有找到 .png 文件')
  process.exit(0)
}

console.log(`\n🔍 发现 ${pngFiles.length} 个角色图像文件...\n`)

let created = 0
let skipped = 0
let overwritten = 0

for (const file of pngFiles) {
  const nameEn = basename(file, '.png')
  const id = toId(nameEn)
  const avatarPath = `/people/${file}`
  const outPath = join(CHAR_DIR, `${id}.json`)

  if (existsSync(outPath) && !force) {
    console.log(`  ⏭️  跳过 (已存在): ${id}.json`)
    skipped++
    continue
  }

  const template = buildTemplate(nameEn, avatarPath)
  writeFileSync(outPath, JSON.stringify(template, null, 2), 'utf-8')

  if (force && existsSync(outPath)) {
    console.log(`  🔄 覆写: ${id}.json (${nameEn}${MARRIAGEABLE.has(nameEn) ? ' ✨可结婚' : ''})`)
    overwritten++
  } else {
    console.log(`  ✅ 生成: ${id}.json (${nameEn}${MARRIAGEABLE.has(nameEn) ? ' ✨可结婚' : ''})`)
    created++
  }
}

console.log('\n' + '─'.repeat(50))
console.log(`📊 生成完成:`)
console.log(`   新建: ${created} 个`)
console.log(`   跳过: ${skipped} 个（已存在，使用 --force 可覆写）`)
console.log(`   覆写: ${overwritten} 个`)
console.log('\n⚡ 下一步: 请在 src/data/characters/ 目录下逐个补充:')
console.log('   1. nameZh (角色中文名)')
console.log('   2. introShort / introLong (角色简介)')
console.log('   3. tags (性格标签)')
console.log('   4. traitVector (八维特质向量，0-100)')
console.log('   5. romanceProfile (恋爱特质向量，0-100)')
console.log('   6. partnerPreference (伴侣偏好与冲突规则)')
console.log('   7. copy (结果文案)')
console.log('\n运行 npm run validate 检查数据完整性。')
console.log('─'.repeat(50))
