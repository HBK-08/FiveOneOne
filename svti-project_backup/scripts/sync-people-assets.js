#!/usr/bin/env node
/**
 * sync-people-assets.js
 * SVTI 角色资源同步检查脚本
 *
 * 用法: node scripts/sync-people-assets.js
 *
 * 功能：
 * 1. 比对 public/people/*.png 与 src/data/characters/*.json 的对应关系
 * 2. 报告：有图没有 JSON 的角色、有 JSON 没有图的角色
 * 3. 检查 JSON 中的 avatar 字段是否指向实际存在的文件
 * 4. 不做任何写入操作，仅报告状态
 */

import { readdirSync, existsSync, readFileSync } from 'fs'
import { join, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PEOPLE_DIR = join(ROOT, 'public', 'people')
const CHAR_DIR = join(ROOT, 'src', 'data', 'characters')

function toId(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[.']/g, '')
}

// ─── 收集所有 PNG ──────────────────────────────────────────────────────────────
console.log('\n🖼️  扫描 public/people/ 中的图像文件...')
if (!existsSync(PEOPLE_DIR)) {
  console.error(`❌ 目录不存在: ${PEOPLE_DIR}`)
  process.exit(1)
}

const pngFiles = readdirSync(PEOPLE_DIR).filter(f => f.toLowerCase().endsWith('.png'))
const pngByName = new Map()
for (const f of pngFiles) {
  const nameEn = basename(f, '.png')
  const id = toId(nameEn)
  pngByName.set(id, { file: f, nameEn })
}
console.log(`   发现 ${pngFiles.length} 个 .png 文件`)

// ─── 收集所有 JSON ─────────────────────────────────────────────────────────────
console.log('\n📄 扫描 src/data/characters/ 中的角色 JSON...')
if (!existsSync(CHAR_DIR)) {
  console.warn('   ⚠️  characters/ 目录不存在，请先运行 npm run init:characters')
  process.exit(0)
}

const jsonFiles = readdirSync(CHAR_DIR).filter(f => f.endsWith('.json'))
const jsonByName = new Map()
for (const f of jsonFiles) {
  const id = basename(f, '.json')
  let data = null
  try {
    data = JSON.parse(readFileSync(join(CHAR_DIR, f), 'utf-8'))
  } catch {
    console.error(`   ❌ 解析失败: ${f}`)
  }
  jsonByName.set(id, { file: f, data })
}
console.log(`   发现 ${jsonFiles.length} 个 .json 文件`)

// ─── 报告：有图没有 JSON ───────────────────────────────────────────────────────
console.log('\n📊 同步状态报告:')
console.log('─'.repeat(60))

const pngNoJson = []
for (const [id, info] of pngByName) {
  if (!jsonByName.has(id)) {
    pngNoJson.push(info)
  }
}

if (pngNoJson.length > 0) {
  console.log(`\n🟡 有图但缺少 JSON (${pngNoJson.length} 个) — 可运行 npm run init:characters 生成模板:`)
  for (const { nameEn, file } of pngNoJson) {
    console.log(`   • ${nameEn} (${file})`)
  }
} else {
  console.log('\n✅ 所有 PNG 都有对应的 JSON 文件')
}

// ─── 报告：有 JSON 没有图 ──────────────────────────────────────────────────────
const jsonNoPng = []
for (const [id, info] of jsonByName) {
  if (!pngByName.has(id)) {
    jsonNoPng.push({ id, ...info })
  }
}

if (jsonNoPng.length > 0) {
  console.log(`\n🔴 有 JSON 但缺少 PNG (${jsonNoPng.length} 个) — 请将对应图像放入 public/people/:`)
  for (const { id, file } of jsonNoPng) {
    console.log(`   • ${id} (${file})`)
  }
} else {
  console.log('✅ 所有 JSON 都有对应的 PNG 文件')
}

// ─── 报告：avatar 字段核实 ─────────────────────────────────────────────────────
console.log('\n🔗 检查 avatar 字段是否指向有效文件...')
let avatarOk = 0
let avatarMissing = 0

for (const [id, { file, data }] of jsonByName) {
  if (!data) continue
  const avatar = data.avatar
  if (!avatar) {
    console.warn(`   ⚠️  ${file}: 缺少 avatar 字段`)
    avatarMissing++
    continue
  }
  // avatar 应该是 /people/Xxx.png 格式
  const publicPath = join(ROOT, 'public', avatar.replace(/^\//, ''))
  if (existsSync(publicPath)) {
    avatarOk++
  } else {
    console.warn(`   ⚠️  ${file}: avatar 指向的文件不存在 — ${avatar}`)
    avatarMissing++
  }
}

console.log(`   avatar 有效: ${avatarOk} / ${jsonByName.size}`)
if (avatarMissing > 0) {
  console.warn(`   ⚠️  ${avatarMissing} 个角色的 avatar 字段存在问题`)
}

// ─── 报告：traitVector 完整性 ──────────────────────────────────────────────────
console.log('\n🧠 检查 traitVector 填写状态...')
const TRAIT_KEYS = ['social', 'pace', 'emotion', 'value', 'natureTech', 'adventure', 'bonding', 'aesthetic']
let fullVector = 0
let partialVector = 0
let nullVector = 0

for (const [id, { file, data }] of jsonByName) {
  if (!data?.traitVector) continue
  const nullCount = TRAIT_KEYS.filter(k => data.traitVector[k] === null).length
  if (nullCount === 0) fullVector++
  else if (nullCount === TRAIT_KEYS.length) nullVector++
  else partialVector++
}

console.log(`   完整 (全部非 null): ${fullVector} 个`)
if (partialVector > 0) console.log(`   部分填写:           ${partialVector} 个`)
console.log(`   全为 null (占位):   ${nullVector} 个`)

// ─── 总结 ──────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60))
const total = Math.max(pngFiles.length, jsonFiles.length)
const matched = jsonByName.size - jsonNoPng.length
console.log(`📈 总计: ${total} 个角色资源`)
console.log(`   • PNG ↔ JSON 已对齐: ${matched}`)
console.log(`   • PNG 缺少 JSON:     ${pngNoJson.length}`)
console.log(`   • JSON 缺少 PNG:     ${jsonNoPng.length}`)
console.log(`   • traitVector 已完成: ${fullVector} / ${jsonFiles.length}`)
console.log('─'.repeat(60))

if (pngNoJson.length > 0) {
  console.log('\n💡 提示: 运行以下命令为缺少 JSON 的角色生成模板:')
  console.log('   npm run init:characters')
}
