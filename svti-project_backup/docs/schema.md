# SVTI 数据结构说明

> 所有数据文件位于 `src/data/`，由 `src/utils/contentLoader.ts` 统一加载。

---

## 1. 角色数据 `src/data/characters/<id>.json`

每个角色对应一个独立的 JSON 文件，文件名为 `<id>.json`（小写 kebab-case）。

### 完整结构

```jsonc
{
  "id": "abigail",              // string，唯一标识，kebab-case
  "nameZh": "艾比盖尔",          // string，中文名
  "nameEn": "Abigail",          // string，英文名（与 PNG 文件名一致）
  "avatar": "/people/Abigail.png", // string，相对于 public/ 的路径
  "introShort": "...",          // string，简短介绍（≤ 40 字）
  "introLong": "...",           // string，详细介绍（100-200 字）
  "tags": ["冒险型", "感性"],   // string[]，性格标签（3-6 个）

  // ─── 特质向量（0-100，50 为中性）───────────────────────────
  "traitVector": {
    "social": 55,     // 社交取向：低=独处沉浸，高=社区投入
    "pace": 38,       // 节奏取向：低=松弛随性，高=规划推进
    "emotion": 65,    // 情感表达：低=含蓄克制，高=直接外露
    "value": 25,      // 价值核心：低=浪漫理想，高=现实务实
    "natureTech": 42, // 世界兴趣：低=自然手作，高=技术系统
    "adventure": 88,  // 探索倾向：低=安稳日常，高=冒险未知
    "bonding": 70,    // 关系模式：低=自主边界，高=亲密依附
    "aesthetic": 80   // 美学精神：低=朴素现实，高=艺术幻想
    // 未填充时可设为 null（会被匹配算法过滤）
  },

  // ─── 恋爱画像（0-100，50 为中性）──────────────────────────
  "romanceProfile": {
    "stability": 38,       // 关系稳定性偏好
    "openness": 72,        // 情感开放度
    "independence": 60,    // 个体独立性
    "romance": 78,         // 浪漫表达需求
    "adventure": 88,       // 关系中的冒险感
    "domesticity": 30,     // 家庭生活投入度
    "socialPresence": 48,  // 关系的社交展示度
    "growthSupport": 65    // 对伴侣成长的支持意愿
    // 未填充时可设为 null
  },

  // ─── 伴侣偏好（影响"理想伴侣"算法）────────────────────────
  "partnerPreference": {
    "preferredGender": ["any"],  // "any" | "male" | "female" | "nonbinary"
    "orientationMode": "player_preference", // "flexible" | "fixed" | "player_preference"
    "weights": {             // 匹配权重加成（叠加到全局 needWeights）
      "adventure": 1.5,
      "aesthetic": 1.3
    },
    "hardFilters": {
      "excludeIfOrientationMismatch": false  // 性别偏好不匹配时是否排除
    },
    "conflictRules": [       // 冲突惩罚规则列表
      {
        "field": "independence", // 用户恋爱需求的维度名
        "operator": "<",         // ">" | "<" | ">=" | "<=" | "=="
        "value": 25,             // 触发阈值
        "penalty": 12,           // 惩罚分值（从匹配分中扣除）
        "reason": "过度依赖可能让角色感到窒息" // 显示在冲突预警中
      }
    ]
  },

  // ─── 结果文案（与该角色相似时显示）────────────────────────
  "copy": {
    "oneLiner": "你是一个总在寻找下一段冒险的灵魂。",
    "analysis": "你和艾比盖尔一样...",
    "getAlongAdvice": "与艾比盖尔相处时...",
    "conflictWarning": "艾比盖尔的随性可能...",
    "farmLifeAdvice": "你可能会像艾比盖尔一样..."
  },

  // ─── 元数据 ───────────────────────────────────────────────
  "meta": {
    "marriageable": true,          // 游戏中是否可结婚
    "source": "Stardew Valley 1.6", // 来源版本
    "version": "1.0"               // 数据版本
  }
}
```

---

## 2. 八维定义 `src/data/dimensions.json`

```jsonc
{
  "dimensions": [
    {
      "id": "social",                  // 维度 ID（与 traitVector 键一致）
      "nameZh": "社交取向",
      "nameEn": "Social Orientation",
      "lowLabel": "独处沉浸",          // 低分端描述
      "highLabel": "社区投入",         // 高分端描述
      "radarOrder": 1,                 // 雷达图显示顺序（1-8）
      "axisMapping": {
        "axis": "SC",                  // 映射到的四字母轴（SC/FP/RI/NT）
        "weight": 0.6                  // 在该轴中的权重（同轴权重之和应为 1.0）
      }
    }
    // ... 8 个维度
  ],
  "axes": [
    {
      "id": "SC",
      "nameZh": "社群取向",
      "nameEn": "Social vs Communal",
      "lowLetter": "S",               // 低分时对应字母
      "highLetter": "C",              // 高分时对应字母
      "lowLabel": "独处沉浸",
      "highLabel": "社区投入"
    }
    // ... 4 个轴：SC, FP, RI, NT
  ]
}
```

---

## 3. 题目数据 `src/data/questions.full.json`

每题为一个对象，**数组顺序即出题顺序**。

```jsonc
{
  "id": "q001",              // string，唯一 ID（全版 q+数字，短版 sq+数字）
  "version": "full",         // "full" | "short"
  "prompt": "题目正文",
  "promptSupplement": "",    // 补充说明（可为空字符串）
  "type": "choice",          // "choice" | "scale"

  // choice 题：options 数组（顺序：低维→高维，以便得分映射正确）
  "options": [
    { "label": "选项文字", "value": "a" }
    // value 通常为 "a"/"b"/"c"/"d"
  ],

  // scale 题：5 级量表标签（options 为空数组）
  "scaleLabels": {
    "low": "完全不同意",
    "mid": "中立",
    "high": "完全同意"
  },

  // 对哪些维度产生影响（delta 表示满分时的分值变化范围）
  "targetVectors": {
    "trait": [                // 影响特质向量
      { "dimension": "social", "delta": 22 }
    ],
    "romance": [              // 影响恋爱需求向量（可选）
      { "dimension": "openness", "delta": 10 }
    ]
  },

  "primaryDimension": "social",    // 主测维度（用于管理页统计）
  "secondaryDimension": "bonding", // 副测维度（可选）

  "reverseScored": false,    // true 时该题得分取反
  "consistencyTag": null,    // 一致性检测标签（同标签的正向和反向题会互相检测）

  "forRomanceOnly": false,   // true 时只影响恋爱向量，不影响特质向量
  "weight": 1.0,             // 题目权重（默认 1.0，伴侣题建议 1.2）
  "explanationKey": "social_participation"  // 预留扩展键
}
```

### 选项得分映射规则

对于 **choice 题**：
- 选项索引（从 0 开始）+ 1 → 原始分 1-4
- 原始分经 `normalizeScore()` 归一化为 [-1, 1]
- **约定：选项应从"维度低"排到"维度高"**（即 'a'=最低，最后一项=最高）

对于 **scale 题**：
- 用户点击数字 1-5 → 直接作为原始分
- 经 `normalizeScore()` 归一化为 [-1, 1]

---

## 4. 评分规则 `src/data/scoring.rules.json`

```jsonc
{
  // 四字母轴计算权重（八维 → 四轴）
  "typeAxisWeights": {
    "SC": { "social": 0.6, "bonding": 0.4 },
    "FP": { "pace": 1.0 },
    "RI": { "value": 0.8, "aesthetic": 0.4, "emotion": 0.2 },
    "NT": { "natureTech": 0.7, "adventure": 0.3 }
  },

  // 最像角色匹配权重（加权曼哈顿距离）
  "characterMatch": {
    "weights": { "social": 1.0, "pace": 1.0, ... },
    "distanceMode": "manhattan"
  },

  // 理想伴侣匹配权重
  "romanceMatch": {
    "needWeights": { "stability": 1.0, "openness": 1.0, ... },
    "complementBonus": { // 互补加成规则
      "enabled": true,
      "dimensions": [
        { "userTrait": "social", "characterTrait": "bonding", "bonus": 5, "reason": "..." }
      ]
    },
    "conflictPenalty": { "enabled": true, "defaultPenalty": 8 },
    "hardFilters": {
      "orientationMismatch": { "enabled": true, "strategy": "exclude" },
      "extremeValueConflict": { "enabled": true, "threshold": 60, "strategy": "penalty_cap" }
    },
    "genderAndRelation": {
      "defaultPool": "all",
      "filterStrategy": "preference_then_all"
    }
  },

  // 一致性检测配置
  "consistency": {
    "reverseMultiplier": -1,   // 反向题得分乘数（固定 -1）
    "tolerance": 15            // 允许的最大差异阈值
  }
}
```

---

## 5. 类型映射 `src/data/type-map.json`

```jsonc
{
  "types": {
    "SFRN": {                    // 四字母类型码
      "title": "林间隐士",
      "keywords": ["安静", "自然", "随性", "务实"],
      "description": "你享受独处的时光..."
    }
    // 共 16 种（SC×FP×RI×NT 全排列）
  }
}
```

---

## 6. 展示文案 `src/data/display.copy.json`

```jsonc
{
  "result": {
    "oneLinerTemplate": "你的灵魂深处，住着一位{topCharacter}。",
    "analysisPrefix": "根据你的选择...",
    "getAlongAdvicePrefix": "...",
    "conflictWarningPrefix": "...",
    "farmLifeAdvicePrefix": "...",
    "romanceTopPrefix": "...",
    "romanceBottomPrefix": "..."
  },
  "shareCard": {
    "titleTemplate": "我是 {typeCode} 型",
    "subtitleTemplate": "最像 {characterName} · 理想伴侣是 {romanceName}",
    "cta": "来测测你的 SVTI 类型"
  },
  "admin": {
    "title": "SVTI 本地管理页",
    "description": "..."
  }
}
```

---

## 7. TypeScript 类型总览

所有类型定义在 `src/types/`，通过 `src/types/index.ts` 统一导出。

| 类型名 | 文件 | 描述 |
|--------|------|------|
| `Character` | `character.ts` | 角色完整数据 |
| `TraitVector` | `character.ts` | 八维特质向量 |
| `RomanceProfile` | `character.ts` | 恋爱画像向量 |
| `PartnerPreference` | `character.ts` | 伴侣偏好配置 |
| `ConflictRule` | `character.ts` | 冲突规则 |
| `Question` | `question.ts` | 题目数据 |
| `QuestionOption` | `question.ts` | 题目选项 |
| `DimensionDefinition` | `dimension.ts` | 维度定义 |
| `AxisDefinition` | `dimension.ts` | 轴定义 |
| `QuizResult` | `result.ts` | 完整结果数据 |
| `TopCharacter` | `result.ts` | 最像角色结果 |
| `TopRomance` | `result.ts` | 理想伴侣结果 |
| `SVTIType` | `result.ts` | 四字母类型 |
| `DimensionScore` | `result.ts` | 单维度得分 |

---

## 8. 算法说明

### A. 类型码计算（`src/utils/typeEngine.ts`）

```
输入: TraitVector (8 维, 各 0-100)
输出: SVTIType { code: "SPIN", axisScores: { SC:62, FP:45, RI:70, NT:38 } }

步骤:
1. 对每条轴 (SC/FP/RI/NT)，取相关维度的加权平均：
   axisScore = 50 + Σ (dimValue - 50) × weight
2. axisScore ≥ 50 → 高分字母；< 50 → 低分字母
3. 四轴拼接 → 类型码
```

| 轴 | 低分字母 | 高分字母 | 相关维度 |
|----|---------|---------|---------|
| SC | S (独处) | C (社群) | social×0.6 + bonding×0.4 |
| FP | F (随性) | P (规划) | pace×1.0 |
| RI | R (务实) | I (理想) | value×0.8 + aesthetic×0.4 + emotion×0.2 |
| NT | N (自然) | T (技术) | natureTech×0.7 + adventure×0.3 |

### B. 最像角色匹配（`src/utils/characterMatcher.ts`）

```
输入: userTraitVector, 角色列表, 匹配权重
输出: TopCharacter[] (前3名)

步骤:
1. 过滤: 排除 traitVector 全为 null 的角色
2. 计算加权曼哈顿距离:
   distance = Σ |userDim - charDim| × weight[dim]
3. score = max(0, 100 - distance / 8)
4. 排序取前3
5. 分析最接近的3个维度 & 差异最大的2个维度
```

### C. 理想伴侣匹配（`src/utils/romanceMatcher.ts`）

```
输入: userLoveNeedVector, userTraitVector, 用户性别/偏好, 角色列表
输出: { top: TopRomance[3], bottom: TopRomance }

步骤:
1. 硬门槛过滤: orientationMismatch → 直接排除 (allowAllPool=true 时跳过)
2. 基础匹配分:
   score = 50 - Σ |need - romanceProfile[dim]| × 0.5 × needWeight[dim]
3. 互补加成: 用户 social 与角色 bonding 差距 >20 → +bonus
4. 冲突惩罚: 检查角色的 conflictRules，触发则扣分
5. 排序: 最高3名=理想伴侣, 最低1名=最不适合
```

### D. 一致性检测（`src/utils/consistencyCheck.ts`）

对 `consistencyTag` 相同的正向题和反向题进行交叉检验。  
若两题答案差异超过阈值（默认 2 分），生成警告。  
当前仅用于调试显示，不影响最终得分。

---

## 9. 数据扩展指南

### 新增角色

1. 将角色头像放入 `public/people/<NameEn>.png`
2. 在 `src/data/characters/` 创建 `<id>.json`（参考已有文件格式）
3. 填写 `traitVector`（8 维，各 0–100）和 `romanceProfile`
4. 运行 `npm run validate` 验证

### 新增题目

1. 在 `src/data/questions.full.json` 追加题目对象
2. 遵循字段规范（见本文第 3 节）
3. 运行 `npm run validate`

### 调整权重

直接修改 `src/data/scoring.rules.json` 中的权重值，无需改动代码。

### 新增类型描述

`src/data/type-map.json` 中每个键对应一种 4 字母类型码（全 16 种），可修改 `title`、`keywords`、`description`。
