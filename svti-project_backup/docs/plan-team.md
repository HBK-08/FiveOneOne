# SVTI 团队协作说明

> Stardew Valley Type Indicator —— 基于星露谷物语角色画像的人格测试网页

---

## 项目定位

SVTI 是一款**完全本地运行**的前端网页应用。用户完成 50 道题后，系统输出：

- 最像的星露谷角色 Top 3（特质匹配）
- 理想伴侣 Top 3 + 最不适合对象
- 四字母 SVTI 类型码（SC × FP × RI × NT）
- 八维雷达图
- 个性化文案（分析、建议、冲突预警、农场推荐）
- 可分享卡片

**无需后端、无需数据库、无需联网。**

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Vue 3 + Composition API |
| 构建 | Vite 5 |
| 类型 | TypeScript 5 |
| 状态 | Pinia |
| 路由 | Vue Router 4（Hash 模式，支持静态部署）|
| 样式 | 原生 CSS + CSS 变量（主题定义在 index.html）|
| 数据 | 本地 JSON 文件（无 API 调用）|

---

## 目录职责速查

```
svti-project/
├─ public/people/         ← 所有角色头像 PNG（命名：原英文名.png）
├─ src/
│  ├─ data/
│  │  ├─ characters/      ← 每个角色一个 JSON（核心数据，需人工填充）
│  │  ├─ questions.full.json  ← 完整 50 题
│  │  ├─ questions.short.json ← 短版 12 题（示例/调试用）
│  │  ├─ dimensions.json      ← 八维定义 + 四轴映射
│  │  ├─ scoring.rules.json   ← 所有权重参数（可调）
│  │  ├─ type-map.json        ← 16 种类型码对应名称/描述
│  │  └─ display.copy.json    ← 结果页固定文案模板
│  ├─ components/
│  │  ├─ common/          ← BaseButton、BaseCard
│  │  ├─ quiz/            ← ProgressBar、QuestionCard、ChoiceQuestion、ScaleQuestion
│  │  ├─ result/          ← CharacterCard、RomanceCard、RadarChart、ShareCard
│  │  └─ share/           ← （预留扩展）
│  ├─ pages/              ← 四个页面（Home/Quiz/Result/Admin）
│  ├─ stores/             ← quizStore、resultStore、configStore
│  ├─ utils/              ← 所有算法（不含 UI 逻辑）
│  └─ types/              ← TypeScript 类型定义
├─ scripts/               ← 本地维护脚本
└─ docs/                  ← 本目录
```

---

## 分工建议

### 数据填充（优先级最高）
由熟悉星露谷物语的成员负责：

1. 运行 `npm run init:characters` 生成所有角色的 JSON 模板
2. 逐个填写 `src/data/characters/*.json` 中的：
   - `nameZh`（中文名）
   - `traitVector`（八维，各维度 0–100）
   - `romanceProfile`（恋爱特质，0–100）
   - `partnerPreference.conflictRules`（冲突规则）
   - `copy`（五段文案）
3. 运行 `npm run validate` 验证数据

参考已完成的三个示例：`abigail.json`、`sebastian.json`、`leah.json`

### 题库优化
- 现有 50 题已覆盖八维，可根据实际测试反馈调整选项权重
- 新增题目只需在 `questions.full.json` 中添加对象，字段参考 `docs/schema.md`
- 选项顺序约定：**从低分（维度弱）到高分（维度强）排列**

### 前端开发
- 组件在 `src/components/`，样式变量在 `index.html` 的 `:root`
- 算法逻辑严格放在 `src/utils/`，不写在 Vue 组件里
- 新增页面需同步在 `src/router/index.ts` 注册路由

### 权重调优
- 所有权重在 `src/data/scoring.rules.json`，修改后即时生效
- 不需要改代码，只改 JSON

---

## 本地运行

```bash
npm install
npm run dev          # 开发模式
npm run build        # 构建生产版本
npm run validate     # 校验数据完整性
npm run init:characters   # 批量生成角色 JSON 模板
npm run sync:assets       # 检查图像与 JSON 对齐状态
```

---

## 数据流向（简版）

```
用户作答
   ↓
quizStore.answers (Pinia)
   ↓
utils/scoring.computeVectors()
   → userTraitVector (八维)
   → userLoveNeedVector (八维恋爱需求)
   ↓
三个并行计算：
   A. utils/typeEngine.computeSVTIType()   → 四字母类型码
   B. utils/characterMatcher.matchCharacters() → Top 3 角色
   C. utils/romanceMatcher.matchRomance()  → Top 3 伴侣 + Bottom 1
   ↓
resultStore.setResult()
   ↓
ResultPage 展示
```

---

## 验收检查清单

- [ ] `npm install && npm run dev` 无报错
- [ ] 首页可正常加载，点击"开始测试"进入测试页
- [ ] 测试页显示进度条，选项可点击，支持上一题/下一题
- [ ] 完成测试后跳转结果页，显示类型码、角色卡片、伴侣卡片
- [ ] 雷达图正常渲染
- [ ] 管理页显示维度列表和题目数量
- [ ] `npm run validate` 对已填充的角色通过校验
- [ ] 缺少 traitVector 的角色不导致页面崩溃（被过滤）
