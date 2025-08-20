import express from 'express';
import cors from 'cors';
const app = express();

// 启用CORS
app.use(cors());
app.use(express.json());

// 主要翻译API
app.post('/translate', (req, res) => {
  console.log('收到翻译请求:', req.body);
  
  const { target, segments } = req.body;
  
  // 模拟翻译结果
  const translatedSegments = segments.map(segment => ({
    ...segment,
    text: `[已翻译到${target}] ${segment.text}`
  }));
  
  res.json({
    translated: target,
    segments: translatedSegments
  });
});

// 词汇管理API
app.post('/api/vocabulary', (req, res) => {
  console.log('收到词汇请求:', req.body);
  res.json({ success: true, data: req.body });
});

app.get('/api/vocabulary', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, original: 'hello', translation: '你好', context: 'greeting' },
      { id: 2, original: 'world', translation: '世界', context: 'noun' }
    ]
  });
});

// 移动端同步API
app.post('/api/sync', (req, res) => {
  console.log('收到同步请求:', req.body);
  res.json({ success: true, message: '同步成功' });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`测试后端运行在 http://localhost:${PORT}`);
  console.log('支持的端点:');
  console.log('- POST /translate - 翻译服务');
  console.log('- POST /api/vocabulary - 添加词汇');
  console.log('- GET /api/vocabulary - 获取词汇列表');
  console.log('- POST /api/sync - 移动端同步');
});
