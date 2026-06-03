const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const UPSTREAM = 'https://api.987ai.vip';

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Proxy all /api/* requests to upstream
app.all('/api/*', async (req, res) => {
  const url = UPSTREAM + req.originalUrl;
  try {
    const opts = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      opts.body = JSON.stringify(req.body);
    }
    const upstream = await fetch(url, opts);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: '上游服务不可达' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
