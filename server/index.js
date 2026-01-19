import express from 'express';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const app = express();
const port = process.env.PORT || 5174;

app.use(express.json({ limit: '1mb' }));

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const extractXText = (url, html) => {
  if (!/https?:\/\/(?:www\.)?x\.com\//i.test(url)) {
    return null;
  }

  const match = html.match(/"full_text"\s*:\s*"([^"]+)"/);
  if (!match?.[1]) {
    return null;
  }

  const decoded = match[1]
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

  const cleaned = decoded.replace(/\s+/g, ' ').trim();
  return cleaned ? { title: 'X (Tweet)', text: cleaned } : null;
};

app.post('/api/readability', async (req, res) => {
  const { url } = req.body ?? {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'URL is required.' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ message: 'Enter a URL starting with http:// or https://.' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (RSVP Speed Reader)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: `Request failed (${response.status}).` });
    }

    const html = await response.text();
    const xResult = extractXText(url, html);

    if (xResult) {
      return res.json(xResult);
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const text = article?.textContent?.trim();

    if (!text) {
      return res.status(422).json({ message: 'Unable to extract readable text from this page.' });
    }

    return res.json({ title: article?.title?.trim() || '', text });
  } catch (error) {
    return res.status(500).json({ message: error?.message || 'Failed to fetch the URL.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`RSVP server listening on ${port}`);
});
