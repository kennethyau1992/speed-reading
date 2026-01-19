import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

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

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  } catch {
    return {};
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const { url } = await readJsonBody(req);

  if (!url || typeof url !== 'string') {
    res.status(400).json({ message: 'URL is required.' });
    return;
  }

  if (!isValidUrl(url)) {
    res.status(400).json({ message: 'Enter a URL starting with http:// or https://.' });
    return;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (RSVP Speed Reader)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ message: `Request failed (${response.status}).` });
      return;
    }

    const html = await response.text();
    const xResult = extractXText(url, html);

    if (xResult) {
      res.status(200).json(xResult);
      return;
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const text = article?.textContent?.trim();

    if (!text) {
      res.status(422).json({ message: 'Unable to extract readable text from this page.' });
      return;
    }

    res.status(200).json({ title: article?.title?.trim() || '', text });
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch the URL.' });
  }
}
