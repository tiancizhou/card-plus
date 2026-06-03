const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const UPSTREAM = 'https://api.987ai.vip';

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.all('/api/*', async (req, res) => {
  const url = UPSTREAM + req.originalUrl;
  console.log(`[proxy] ${req.method} ${req.originalUrl} -> ${url}`);
  try {
    const opts = { method: req.method, headers: { 'Content-Type': 'application/json' } };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      opts.body = JSON.stringify(req.body);
    }
    const upstream = await fetch(url, opts);
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error: text }; }
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('[proxy] error:', err.message);
    res.status(502).json({ error: '上游服务不可达' });
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
