import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

// 解决路径问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEXT_DIR = path.join(__dirname, 'src', 'data', 'characters');

if (!fs.existsSync(TEXT_DIR)) {
  fs.mkdirSync(TEXT_DIR, { recursive: true });
}

async function scrapeAllText() {
  console.log('🚀 第一步：正在潜入村委会，获取完整的星露谷居民名单...');
  
  try {
    // 1. 先去总页面，把所有人的名字抓下来
    const { data: indexHtml } = await axios.get('https://zh.stardewvalleywiki.com/%E5%B1%85%E6%B0%91');
    const $index = cheerio.load(indexHtml);
    
    // 使用 Set 自动去除重复的名字
    let allCharacters = new Set(); 
    
    $index('img').each((i, el) => {
      const src = $index(el).attr('src');
      const alt = $index(el).attr('alt') || '';
      
      // 这里的过滤逻辑和图片爬虫一样，找出包含人物名字的图片标签
      if (src && src.includes('.png') && !src.includes('Icon') && alt.length > 1) {
         // 把图片名字里的非法字符和后缀去掉，只保留纯中文名
         const name = alt.replace(/[\/\\?%*:|"<>]/g, '').trim();
         allCharacters.add(name);
      }
    });

    const charactersArray = Array.from(allCharacters);
    console.log(`📋 成功获取到 ${charactersArray.length} 位居民名单！`);
    console.log(`⏳ 预计需要抓取 ${charactersArray.length} 秒，请耐心等待，去喝口水吧... \n`);

    // 2. 开始根据获取到的名单，挨个去抓他们的专属页面
    let successCount = 0;
    for (const name of charactersArray) {
      try {
        const url = `https://zh.stardewvalleywiki.com/${encodeURIComponent(name)}`;
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);
        
        let description = '';
        
        // 抓取正文前 4 段的内容
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
          console.log(`⚠️ 页面 [${name}] 没有找到正文介绍，已跳过。`);
        }

        // 🛑 礼貌延时：等待 1 秒再发下一个请求
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.log(`❌ 抓取 [${name}] 失败: 可能维基没有这个人的独立页面`);
      }
    }
    
    console.log(`\n🎉 大功告成！共成功抓取 ${successCount} 个人物的介绍。`);
    
  } catch (error) {
    console.error('💣 获取名单失败：', error.message);
  }
}

scrapeAllText();