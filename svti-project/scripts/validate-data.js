#!/usr/bin/env node
/**
 * validate-data.js
 * SVTI 数据校验脚本
 * 用法: node scripts/validate-data.js
 *
 * 校验内容：
 * - src/data/characters/*.json 角色数据完整性
 * - src/data/questions.full.json 题目数据完整性
 * - src/data/questions.short.json 短版题目完整性
 * - src/data/dimensions.json 维度定义完整性
 * - src/data/scoring.rules.json 评分规则完整性
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC_DATA = join(ROOT, 'src', 'data')

let errorCount = 0
let warnCount = 0

function error(msg) {
  console.error(`  ❌ ERROR: ${msg}`)
  errorCount++
}

function warn(msg) {
  console.warn(`  ⚠️  WARN:  ${msg}`)
  warnCount++
}

function ok(msg) {
  console.log(`  ✅ OK:    ${msg}`)
}

function loadJSON(filePath, label) {
  if (!existsSync(filePath)) {
    error(`文件不存在: ${filePath}`)
    return null
  }
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    error(`JSON 解析失败 [${label}]: ${e.message}`)
    return null
  }
}

// ─── 维度校验 ─────────────────────────────────────────────────────────────────
console.log('\n📐 校验维度定义 (dimensions.json)...')
const dimensionsData = loadJSON(join(SRC_DATA, 'dimensions.json'), 'dimensions.json')
const TRAIT_DIMENSION_IDS = []
const AXIS_IDS = []
const ROMANCE_DIMENSION_IDS = [
  'stability', 'openness', 'independence', 'romance',
  'adventure', 'domesticity', 'socialPresence', 'growthSupport',
]

if (dimensionsData) {
  const dims = dimensionsData.dimensions || []
  const axes = dimensionsData.axes || []

  if (dims.length < 8) error(`维度数量不足: 期望 8，实际 ${dims.length}`)
  else ok(`维度数量: ${dims.length}`)

  if (axes.length < 4) error(`轴数量不足: 期望 4，实际 ${axes.length}`)
  else ok(`轴数量: ${axes.length}`)

  for (const d of dims) {
    TRAIT_DIMENSION_IDS.push(d.id)
    const missing = ['id', 'nameZh', 'nameEn', 'lowLabel', 'highLabel', 'radarOrder', 'axisMapping'].filter(k => !(k in d))
    if (missing.length) error(`维度 ${d.id || '?'} 缺少字段: ${missing.join(', ')}`)
  }

  for (const a of axes) {
    AXIS_IDS.push(a.id)
    const missing = ['id', 'nameZh', 'nameEn', 'lowLetter', 'highLetter'].filter(k => !(k in a))
    if (missing.length) error(`轴 ${a.id || '?'} 缺少字段: ${missing.join(', ')}`)
  }
}

const ALL_VALID_DIMS = [...TRAIT_DIMENSION_IDS, ...ROMANCE_DIMENSION_IDS]

// ─── 评分规则校验 ──────────────────────────────────────────────────────────────
console.log('\n⚖️  校验评分规则 (scoring.rules.json)...')
const scoringRules = loadJSON(join(SRC_DATA, 'scoring.rules.json'), 'scoring.rules.json')
if (scoringRules) {
  if (!scoringRules.typeAxisWeights) error('缺少 typeAxisWeights')
  else ok('typeAxisWeights 存在')
  if (!scoringRules.characterMatch?.weights) error('缺少 characterMatch.weights')
  else ok('characterMatch.weights 存在')
  if (!scoringRules.romanceMatch?.needWeights) error('缺少 romanceMatch.needWeights')
  else ok('romanceMatch.needWeights 存在')
  if (!scoringRules.romanceMatch?.hardFilters) warn('缺少 romanceMatch.hardFilters（可选）')
  if (!scoringRules.consistency) warn('缺少 consistency 配置（可选）')
}

// ─── 题目校验函数 ──────────────────────────────────────────────────────────────
function validateQuestion(q, index) {
  const prefix = `题目[${index}] id=${q.id || '?'}`
  const errs = []

  if (!q.id) errs.push('缺少 id')
  if (!q.prompt) errs.push('缺少 prompt')
  if (!['choice', 'scale'].includes(q.type)) errs.push(`type 不合法: "${q.type}"`)
  if (q.type === 'choice' && (!q.options || q.options.length < 2)) errs.push('选择题至少需要 2 个选项')
  if (q.type === 'scale' && !q.scaleLabels?.low) errs.push('量表题缺少 scaleLabels.low')
  if (typeof q.weight !== 'number' || q.weight <= 0) errs.push('weight 必须是正数')
  if (typeof q.reverseScored !== 'boolean') errs.push('reverseScored 必须是 boolean')
  if (!q.targetVectors || (!q.targetVectors.trait && !q.targetVectors.romance)) {
    errs.push('targetVectors 缺少 trait 或 romance')
  }

  if (q.primaryDimension && TRAIT_DIMENSION_IDS.length > 0 && !ALL_VALID_DIMS.includes(q.primaryDimension)) {
    errs.push(`primaryDimension "${q.primaryDimension}" 不是已知维度`)
  }

  if (errs.length) {
    errs.forEach(e => error(`${prefix}: ${e}`))
  }
  return errs.length === 0
}

// ─── 完整版题目校验 ────────────────────────────────────────────────────────────
console.log('\n📋 校验完整版题库 (questions.full.json)...')
const questionsFull = loadJSON(join(SRC_DATA, 'questions.full.json'), 'questions.full.json')
let fullOk = 0
if (questionsFull) {
  if (!Array.isArray(questionsFull)) {
    error('questions.full.json 应为数组')
  } else {
    if (questionsFull.length < 50) {
      warn(`完整版题目数量: ${questionsFull.length}（建议 50 题）`)
    } else {
      ok(`完整版题目数量: ${questionsFull.length}`)
    }

    const ids = new Set()
    for (let i = 0; i < questionsFull.length; i++) {
      const q = questionsFull[i]
      if (ids.has(q.id)) error(`重复的题目 id: ${q.id}`)
      else ids.add(q.id)
      if (validateQuestion(q, i + 1)) fullOk++
    }
    ok(`完整版通过校验: ${fullOk} / ${questionsFull.length}`)

    // 检查维度覆盖
    const coveredDims = new Set(questionsFull.map(q => q.primaryDimension))
    for (const dim of TRAIT_DIMENSION_IDS) {
      if (!coveredDims.has(dim)) warn(`维度 "${dim}" 没有对应题目`)
    }
  }
}

// ─── 短版题目校验 ──────────────────────────────────────────────────────────────
console.log('\n📋 校验短版题库 (questions.short.json)...')
const questionsShort = loadJSON(join(SRC_DATA, 'questions.short.json'), 'questions.short.json')
if (questionsShort) {
  if (!Array.isArray(questionsShort)) {
    error('questions.short.json 应为数组')
  } else {
    if (questionsShort.length < 8) {
      warn(`短版题目数量: ${questionsShort.length}（建议 ≥ 8 题）`)
    } else {
      ok(`短版题目数量: ${questionsShort.length}`)
    }
  }
}

// ─── 角色数据校验 ──────────────────────────────────────────────────────────────
console.log('\n🧑 校验角色数据 (characters/)...')
const REQUIRED_CHARACTER_FIELDS = ['id', 'nameZh', 'nameEn', 'avatar', 'introShort', 'introLong', 'tags', 'traitVector', 'romanceProfile', 'partnerPreference', 'copy', 'meta']
const REQUIRED_TRAIT_VECTOR_KEYS = ['social', 'pace', 'emotion', 'value', 'natureTech', 'adventure', 'bonding', 'aesthetic']
const REQUIRED_ROMANCE_PROFILE_KEYS = ['stability', 'openness', 'independence', 'romance', 'adventure', 'domesticity', 'socialPresence', 'growthSupport']
const REQUIRED_COPY_KEYS = ['oneLiner', 'analysis', 'getAlongAdvice', 'conflictWarning', 'farmLifeAdvice']

const charDir = join(SRC_DATA, 'characters')
if (!existsSync(charDir)) {
  error('src/data/characters/ 目录不存在')
} else {
  const charFiles = readdirSync(charDir).filter(f => f.endsWith('.json'))
  if (charFiles.length === 0) {
    warn('characters/ 目录下没有任何角色 JSON 文件')
  } else {
    ok(`发现 ${charFiles.length} 个角色文件`)
  }

  let nullVectorCount = 0
  for (const file of charFiles) {
    const char = loadJSON(join(charDir, file), file)
    if (!char) continue

    const prefix = `角色[${file}]`
    const missingFields = REQUIRED_CHARACTER_FIELDS.filter(k => !(k in char))
    if (missingFields.length) error(`${prefix} 缺少字段: ${missingFields.join(', ')}`)

    if (char.traitVector) {
      const missingTrait = REQUIRED_TRAIT_VECTOR_KEYS.filter(k => !(k in char.traitVector))
      if (missingTrait.length) error(`${prefix} traitVector 缺少: ${missingTrait.join(', ')}`)
      const isAllNull = REQUIRED_TRAIT_VECTOR_KEYS.every(k => char.traitVector[k] === null)
      if (isAllNull) {
        warn(`${prefix} traitVector 全为 null（需要补充实际数值）`)
        nullVectorCount++
      } else {
        for (const k of REQUIRED_TRAIT_VECTOR_KEYS) {
          const v = char.traitVector[k]
          if (v !== null && (typeof v !== 'number' || v < 0 || v > 100)) {
            error(`${prefix} traitVector.${k} 值超出范围 [0-100]: ${v}`)
          }
        }
      }
    }

    if (char.romanceProfile) {
      const missingRomance = REQUIRED_ROMANCE_PROFILE_KEYS.filter(k => !(k in char.romanceProfile))
      if (missingRomance.length) error(`${prefix} romanceProfile 缺少: ${missingRomance.join(', ')}`)
    }

    if (char.copy) {
      const missingCopy = REQUIRED_COPY_KEYS.filter(k => !(k in char.copy))
      if (missingCopy.length) warn(`${prefix} copy 缺少: ${missingCopy.join(', ')}`)
    }

    if (char.meta && typeof char.meta.marriageable !== 'boolean') {
      warn(`${prefix} meta.marriageable 应为 boolean`)
    }
  }

  if (nullVectorCount > 0) {
    warn(`${nullVectorCount} 个角色的 traitVector 仍为占位 null 值，需补充后才能参与匹配计算`)
  }
}

// ─── type-map.json 校验 ────────────────────────────────────────────────────────
console.log('\n🗺️  校验类型映射 (type-map.json)...')
const typeMap = loadJSON(join(SRC_DATA, 'type-map.json'), 'type-map.json')
if (typeMap) {
  const types = Object.keys(typeMap.types || {})
  if (types.length < 16) warn(`类型映射数量: ${types.length}（期望 16，对应 SC×FP×RI×NT 全排列）`)
  else ok(`类型映射数量: ${types.length}`)
}

// ─── 总结 ──────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50))
if (errorCount === 0 && warnCount === 0) {
  console.log('🎉 所有校验通过，没有错误或警告。')
} else {
  if (errorCount > 0) console.error(`💥 发现 ${errorCount} 个错误，需要修复后才能正常运行。`)
  if (warnCount > 0) console.warn(`🟡 发现 ${warnCount} 个警告，建议在正式发布前处理。`)
}
console.log('─'.repeat(50))

process.exit(errorCount > 0 ? 1 : 0)
