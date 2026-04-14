import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEXT_DIR = path.join(__dirname, 'src', 'data', 'characters');

if (!fs.existsSync(TEXT_DIR)) {
  fs.mkdirSync(TEXT_DIR, { recursive: true });
}

// 完整 48 位星露谷居民名单（严格按分类校对）
const characters = [
  // 单身男性 (6)
  "哈维", "谢恩", "山姆", "艾利欧特", "亚历克斯", "塞巴斯蒂安",
  // 单身女性 (6)
  "海莉", "莉亚", "玛鲁", "潘妮", "艾米丽", "阿比盖尔",
  // 镇居民 (20)
  "玛妮", "贾斯", "格斯", "潘姆", "罗宾", "乔迪", "肯特", "威利", 
  "乔治", "马龙", "吉尔", "冈瑟", "刘易斯", "文森特", "皮埃尔", 
  "卡洛琳", "克林特", "艾芙琳", "莱纳斯", "德米特里厄斯",
  // 其他 (16)
  "法师", "桑迪", "矮人", "雷欧", "爷爷", "州长", "门卫", "莫里斯", 
  "仆从", "贝啼", "祝尼魔", "老水手", "齐先生", "科罗布斯", "蜗牛教授", "菲兹"
];

async function scrapeAllText() {
  console.log(`🚀 开始执行！总共为您准备了 ${characters.length} 位星露谷全员名单。\n`);
  
  let successCount = 0;
  
  for (const name of characters) {
    try {
      const url = `https://zh.stardewvalleywiki.com/${encodeURIComponent(name)}`;
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);
      
      let description = '';
      
      // 提取正文前 4 段的内容
      $('.mw-parser-output > p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 0 && i < 4) {
          description += text + '\n\n';
        }
      });

      if (description) {
        const filePath = path.join(TEXT_DIR, `${name}.md`);
        const mdContent = `# ${name}\n\n## 人物介绍\n\n${description}`;
        fs.writeFileSync(filePath, mdContent, 'utf-8');
        console.log(`✅ 成功保存: ${name}.md`);
        successCount++;
      } else {
        // 某些特殊NPC可能没有长段落介绍，给个提示
        console.log(`⚠️ 页面 [${name}] 没有找到有效的正文介绍，这通常是因为该NPC属于特殊人物，页面结构不同。`);
      }

      // 礼貌延时：等待 1 秒再发下一个请求
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err) {
      console.log(`❌ 抓取 [${name}] 失败: HTTP 状态码 ${err.response?.status || err.message}`);
    }
  }
  
  console.log(`\n🎉 彻底大功告成！共成功抓取 ${successCount} 个人物的介绍。`);
}

scrapeAllText();