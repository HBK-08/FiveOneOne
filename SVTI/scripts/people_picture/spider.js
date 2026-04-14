import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

// 解决 ES Module 下路径的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 目标网址和图片保存目录
const URL = 'https://zh.stardewvalleywiki.com/%E5%B1%85%E6%B0%91';
const IMG_DIR = path.join(__dirname, 'public', 'images');

// 确保 public/images 文件夹存在
if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

async function downloadImages() {
  console.log('🚀 开始潜入星露谷维基获取数据...');
  
  try {
    // 1. 获取网页 HTML
    const { data: html } = await axios.get(URL);
    const $ = cheerio.load(html);
    
    // 2. 找到所有图片
    const images = $('img').toArray();
    let downloadedCount = 0;

    for (const img of images) {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt') || '';

      // 3. 过滤逻辑：星露谷的人物图通常是以 .png 结尾的，且我们只抓取有意义的名称
      if (src && src.includes('.png') && !src.includes('Icon') && alt.length > 1) {
        
        // 维基的图片链接通常是缺少 https: 的相对链接
        const imgUrl = src.startsWith('//') ? `https:${src}` : 
                       src.startsWith('/') ? `https://zh.stardewvalleywiki.com${src}` : src;

        // 清理文件名中的非法字符
        const fileName = alt.replace(/[\/\\?%*:|"<>]/g, '-');
        const filePath = path.join(IMG_DIR, fileName);

        // 为了防止重复下载，如果文件已存在则跳过
        if (!fs.existsSync(filePath)) {
          try {
            console.log(`⏳ 正在捕获: ${fileName}...`);
            // 下载图片流并保存
            const response = await axios({
              url: imgUrl,
              method: 'GET',
              responseType: 'stream'
            });
            
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });
            downloadedCount++;
          } catch (err) {
            console.log(`❌ 下载 ${fileName} 失败: ${err.message}`);
          }
        }
      }
    }
    console.log(`\n🎉 任务完成！共成功抓取 ${downloadedCount} 张图片，已存入 public/images 文件夹。`);
    
  } catch (error) {
    console.error('💣 爬虫运行出错：', error.message);
  }
}

downloadImages();
