# SVTI 使用、数据补全与扩展指南

---

## 一、本地运行

### 前置条件
- Node.js ≥ 18
- npm ≥ 9

### 启动步骤

```bash
cd svti-project
npm install       # 安装依赖（仅需一次）
npm run dev       # 启动开发服务器，访问 http://localhost:5173
```

### 其他命令

```bash
npm run build          # 构建生产版本到 dist/
npm run preview        # 预览构建产物
npm run validate       # 校验数据完整性（详见下节）
npm run init:characters  # 为 public/people/ 中的图像批量生成角色 JSON 模板
npm run sync:assets      # 检查图像与角色 JSON 的对齐状态
```

---

## 二、数据补全流程

### 步骤 1：生成角色模板

```bash
npm run init:characters
```

此命令扫描 `public/people/*.png`，为每个文件在 `src/data/characters/` 生成 JSON 模板。已存在的文件默认跳过，使用 `--force` 参数可覆盖：

```bash
node scripts/init-character-json.js --force
```

### 步骤 2：填充角色数据

打开 `src/data/characters/<id>.json`，按以下顺序填充：

#### 2a. 基础信息
```json
{
  "nameZh": "角色中文名",
  "introShort": "一句话简介（≤ 40 字）",
  "introLong": "详细介绍，描述性格、背景故事（100-200 字）",
  "tags": ["性格标签1", "性格标签2", "性格标签3"]
}
```

#### 2b. 特质向量（最关键）

`traitVector` 的八个维度取值范围均为 **0–100**，50 为中性。

| 维度 | 低分（→0）含义 | 高分（→100）含义 | 参考角色示例 |
|------|--------------|---------------|------------|
| `social` | 独处充电型 | 社交充电型 | 塞巴斯蒂安≈18，亚历克斯≈82 |
| `pace` | 随性而为 | 计划推进 | 艾比盖尔≈38，皮埃尔≈75 |
| `emotion` | 含蓄克制 | 直接外露 | 塞巴斯蒂安≈28，哈利≈78 |
| `value` | 理想浪漫 | 现实务实 | 莉亚≈18，皮埃尔≈75 |
| `natureTech` | 自然手作 | 技术系统 | 莉亚≈15，塞巴斯蒂安≈82 |
| `adventure` | 安稳日常 | 冒险探索 | 哈维≈20，艾比盖尔≈88 |
| `bonding` | 独立边界 | 亲密依附 | 塞巴斯蒂安≈42，潘妮≈82 |
| `aesthetic` | 朴素现实 | 艺术幻想 | 哈维≈35，莉亚≈92 |

**填写建议：**
- 每个数值代表该角色在该维度上的位置，而非"有多好"
- 使用已填充的三个角色（Abigail/Sebastian/Leah）作为锚点参考
- 先定四个最典型的维度，其余从 50 出发微调

#### 2c. 恋爱画像

`romanceProfile` 描述角色**作为伴侣时的特质**（不是对伴侣的要求）：

| 维度 | 低分含义 | 高分含义 |
|------|---------|---------|
| `stability` | 喜欢变化，不稳定 | 重视稳定，可靠 |
| `openness` | 情感内敛，不善沟通 | 开放表达，善于沟通 |
| `independence` | 依赖伴侣，边界感弱 | 独立自主，边界清晰 |
| `romance` | 务实，少浪漫仪式 | 浪漫，重视仪式感 |
| `adventure` | 关系保守，不爱冒险 | 鼓励关系中的新鲜感 |
| `domesticity` | 不在乎家庭生活 | 注重共同的日常生活 |
| `socialPresence` | 低调，不在乎外部认可 | 喜欢公开展示感情 |
| `growthSupport` | 较少关注伴侣成长 | 积极支持伴侣发展 |

#### 2d. 伴侣偏好与冲突规则

```json
"partnerPreference": {
  "preferredGender": ["any"],  // 或 "male" / "female" / "nonbinary"
  "conflictRules": [
    {
      "field": "independence",   // 用户的哪个恋爱需求维度触发冲突
      "operator": "<",           // 运算符
      "value": 25,               // 阈值
      "penalty": 10,             // 从匹配分中扣除的分值
      "reason": "解释为什么这是冲突"
    }
  ]
}
```

#### 2e. 结果文案

```json
"copy": {
  "oneLiner": "一句话结论（用户与该角色最像时显示，≤ 30 字）",
  "analysis": "详细分析（3-5句话，描述用户的性格特征）",
  "getAlongAdvice": "与该角色相处建议（2-4句）",
  "conflictWarning": "潜在冲突预警（1-2句）",
  "farmLifeAdvice": "农场生活风格推荐（1-2句）"
}
```

### 步骤 3：校验数据

```bash
npm run validate
```

输出示例：
```
✅ 所有校验通过，没有错误或警告。
```

如有错误会列出具体问题，按提示修复后重新运行。

---

## 三、题库调整

### 修改现有题目

直接编辑 `src/data/questions.full.json` 中对应的对象。注意：

- 修改 `options` 时，**顺序必须从"维度低"到"维度高"**
- `delta` 表示满分时的贡献值（正数=高分方向，负数=低分方向）
- `weight` 越大，该题对最终向量影响越重

### 新增题目

在 `questions.full.json` 末尾添加新对象，ID 格式为 `q051`、`q052`...

```json
{
  "id": "q051",
  "version": "full",
  "prompt": "你的题目正文",
  "promptSupplement": "",
  "type": "choice",
  "options": [
    { "label": "选项A（低分）", "value": "a" },
    { "label": "选项B（中等）", "value": "b" },
    { "label": "选项C（较高）", "value": "c" },
    { "label": "选项D（高分）", "value": "d" }
  ],
  "scaleLabels": { "low": "", "mid": "", "high": "" },
  "targetVectors": {
    "trait": [{ "dimension": "social", "delta": 20 }]
  },
  "primaryDimension": "social",
  "secondaryDimension": "bonding",
  "reverseScored": false,
  "consistencyTag": null,
  "forRomanceOnly": false,
  "weight": 1.0,
  "explanationKey": "your_key"
}
```

---

## 四、权重调优

所有权重参数在 `src/data/scoring.rules.json`，**修改后无需重启，刷新页面即生效**（开发模式）。

### 调整类型码轴权重

如果类型码计算结果感觉不准确，调整 `typeAxisWeights`：

```json
"typeAxisWeights": {
  "SC": { "social": 0.6, "bonding": 0.4 }
}
```

### 调整角色匹配权重

某些维度比其他维度更重要时，增大其权重：

```json
"characterMatch": {
  "weights": {
    "social": 1.5,  // 社交取向权重加倍
    "pace": 1.0,
    ...
  }
}
```

### 调整伴侣匹配权重

```json
"romanceMatch": {
  "needWeights": {
    "stability": 1.5,  // 稳定性权重提高
    "openness": 1.0,
    ...
  }
}
```

---

## 五、新增角色

1. 将角色头像 PNG 放入 `public/people/角色英文名.png`
2. 运行 `npm run init:characters` 生成 JSON 模板
3. 按"数据补全流程"填充 JSON
4. 运行 `npm run validate` 验证
5. 运行 `npm run sync:assets` 确认图像与 JSON 对齐

---

## 六、调试技巧

### 使用短版模式

在首页勾选"使用短版测试（示例模式）"，只需回答 12 题即可快速看到完整结果流程。

### 使用管理页

访问 `/#/admin` 查看当前数据状态：
- 维度列表
- 题目总数
- 角色总数
- 数据校验报告

### 强制显示特定角色

在 `src/data/scoring.rules.json` 的 `characterMatch.weights` 中，将某个维度权重设为 0 可以降低该维度对匹配的影响，快速测试某个角色是否能被选中。

### 追踪向量计算

在浏览器控制台运行：
```javascript
// 开发模式下，Pinia store 会挂载到 window.__pinia__
const stores = window.__pinia__._s
stores.get('quiz')  // 查看当前答案
stores.get('result')  // 查看计算结果
```

---

## 七、生产部署

```bash
npm run build
```

生成的 `dist/` 目录可直接部署到任何静态托管服务（Nginx、GitHub Pages、Cloudflare Pages 等）。

由于使用 Hash 路由模式（`createWebHashHistory`），**不需要服务器端 URL 重写配置**。

---

## 八、常见问题

**Q: 结果页出现"还没有测试结果"？**
A: 直接访问 `/#/result` 不会有数据，需要先完成测试。正常流程：首页 → 测试页（完成所有题目）→ 自动跳转结果页。

**Q: 角色卡片显示但没有头像？**
A: 检查 `src/data/characters/<id>.json` 中的 `avatar` 字段是否正确，格式为 `/people/英文名.png`，且对应文件存在于 `public/people/`。

**Q: 雷达图不显示？**
A: 需要至少完成测试并有有效的维度分数。在结果存在时，雷达图应自动渲染。若仍不显示，检查浏览器控制台报错。

**Q: 新增的角色不出现在匹配结果中？**
A: 可能原因：① `traitVector` 全为 null（会被过滤）② JSON 文件格式错误（运行 `npm run validate`）③ 浏览器缓存（硬刷新 Ctrl+Shift+R）。

**Q: 如何添加更多题目以达到 50 题？**
A: 参考"题库调整"章节，在 `questions.full.json` 中添加新对象。建议每个维度至少 5 题，伴侣专属题（`forRomanceOnly: true`）8-10 题。
