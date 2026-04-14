# Role & Objective
You are an Expert React/TypeScript Developer and UI/UX Designer. Your task is to build a "Stardew Valley Personality Test" single-page web application from scratch in the current directory. You will execute this plan step-by-step autonomously.

## 1. Tech Stack
* **Framework:** React with Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** `lucide-react`
* **State Management:** React `useState` / `useReducer`

## 2. Project Execution Plan

### Step 1: Project Initialization & Dependencies
1. Run `npm create vite@latest . -- --template react-ts` in the current directory (force overwrite if needed, or clear the directory first).
2. Run `npm install` to install base dependencies.
3. Install Tailwind CSS and its peers: `npm install -D tailwindcss postcss autoprefixer`.
4. Initialize Tailwind: `npx tailwindcss init -p`.
5. Configure `tailwind.config.js` to include `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`.
6. Add Tailwind directives to `src/index.css`.
7. Install icons: `npm install lucide-react`.

### Step 2: Data Seeding (`src/data/quizData.ts`)
Create a file `src/data/quizData.ts` and export the following strict data structures. Do not use external APIs.

```typescript
export const dimensions = ["Social (1 Extrovert / -1 Introvert)", "Activity (1 Farming / -1 Mining)", "Finance (1 Saver / -1 Spender)", "Rule (1 Lawful / -1 Chaotic)"];

export const characters = [
  { name: "Sebastian", vector: [-1, -1, 1, -1], desc: "你像塞巴斯蒂安一样，是个喜欢独处、热爱下矿冒险的夜猫子。比起喧闹的人群，你更享受一个人在房间里敲击键盘或在雨天散步。" },
  { name: "Haley", vector: [1, 1, -1, -1], desc: "你像海莉一样，充满活力且注重生活品质。你喜欢阳光明媚的日子，热爱摄影，虽然偶尔有点小任性，但内心热情。" },
  { name: "Harvey", vector: [-1, 1, 1, 1], desc: "你像哈维医生一样，是个内心细腻、温柔且循规蹈矩的人。你喜欢安稳的田园生活，做事谨慎，让人感到非常可靠。" },
  { name: "Abigail", vector: [1, -1, -1, -1], desc: "你像阿比盖尔一样，是个充满好奇心的冒险家。你对未知的世界充满渴望，不喜欢被传统的规则束缚，随时准备拿起剑走向矿井。" }
];

export const questions = [
  {
    id: 1,
    text: "在一个完美的周五晚上，你通常会选择怎么度过？",
    options: [
      { text: "去星之果实餐吧和大家一起喝酒聊天", weight: [1, 0, -1, 0] },
      { text: "一个人待在房间里打游戏或看书", weight: [-1, 0, 1, 0] }
    ]
  },
  {
    id: 2,
    text: "如果镇长刘易斯让你帮忙筹备节日庆典，你的态度是？",
    options: [
      { text: "严格按照传统流程，确保万无一失", weight: [0, 1, 0, 1] },
      { text: "觉得传统太无聊，想搞点新花样", weight: [0, -1, 0, -1] }
    ]
  },
  {
    id: 3,
    text: "你在矿洞里挖到了一颗极其罕见的五彩碎片，你会怎么做？",
    options: [
      { text: "立刻卖掉换成一大笔金币存起来", weight: [0, 0, 1, 1] },
      { text: "拿到博物馆捐掉或者送给喜欢的人", weight: [1, 0, -1, -1] }
    ]
  },
  {
    id: 4,
    text: "你的农场目前百废待兴，你会优先清理什么？",
    options: [
      { text: "清理杂草和树木，规划出一片整齐的菜地", weight: [0, 1, 1, 1] },
      { text: "不管农场了，带上稿子直接去矿井深处探险", weight: [0, -1, -1, -1] }
    ]
  }
];
```

### Step 3: Types & Algorithm (`src/utils/calculator.ts`)

1. Create `src/types/index.ts` to define interfaces for `Character`, `Option`, `Question`, and `GameState` (which tracks `currentQuestionIndex`, `userVector` (number[]), and `isFinished`).
2. Create `src/utils/calculator.ts`. Write a function `calculateResult(userVector: number[], characters: Character[]): Character`.
3. The logic must use **Euclidean Distance**. Calculate the distance between the `userVector` and each character's `vector`. Return the character with the **minimum** distance.

### Step 4: UI/UX Implementation (`src/App.tsx`)

Build the main application flow with Tailwind CSS.

**Design System:**

- **Colors:** Use an earthy, Stardew Valley-inspired palette. Backgrounds should be soft beige/wood colors (`bg-stone-100`, `bg-amber-50`). Buttons should use nature greens or warm browns.
- **Typography:** Clean, readable sans-serif, with larger, bold headings.
- **Layout:** A centered, max-width card container (`max-w-lg`, `mx-auto`, `mt-10`, `shadow-xl`, `rounded-xl`). Responsive for mobile devices.

**State Machine (3 Views):**

1. **Welcome View (index === 0 && !isFinished):**
   - Title: "你在星露谷物语中是哪个NPC？"
   - Subtitle: "完成这个简短的性格测试，发现你的星际灵魂伴侣。"
   - Call to action: A prominent "开始测试 (Start Test)" button.
2. **Quiz View (index < questions.length):**
   - Progress Bar: Visual indicator of `currentQuestionIndex / questions.length`.
   - Question Text: Display current question prominently.
   - Options: Render as large, clickable block buttons with hover effects.
   - Interaction: onClick -> add option's `weight` to `userVector` using vector addition -> increment `currentQuestionIndex`.
3. **Result View (isFinished === true):**
   - Run `calculateResult`.
   - Display a congratulatory title.
   - Display the winning Character's name in a large font.
   - Display the Character's description text.
   - Add a placeholder UI element (like an empty colored circle with a User icon from lucide-react) representing the character portrait.
   - Call to action: "重新测试 (Restart)" button -> resets state.

### Step 5: Final Review & Polish

1. Ensure there are no TypeScript errors.
2. Ensure simple transition animations between questions (e.g., standard Tailwind `transition-all opacity-100`).
3. Clean up boilerplate code from Vite (`App.css`, unneeded logos).
4. Do not start the dev server, just leave the code ready for production or manual testing.