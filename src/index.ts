import { Hono } from 'hono';
import { Bindings } from './types';
import { stream } from 'hono/streaming';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/optimize', async (c) => {
  // URLパラメータを取得
  const url = c.req.query('url');
  if (!url) {
    return c.json({ error: 'Missing URL parameter' }, 400);
  }

  try {
    // オリジナルサイトのHTMLコンテンツをフェッチ
    const res = await fetch(url);
    if (!res.ok) {
      return c.json({ error: 'Failed to fetch URL' }, 500);
    }
    const html = await res.text();

    // AIへのプロンプト文を生成（JSON形式のアウトプットを要求）
    const messages = [
      {
        role: 'system',
        content:
          'You are a web optimization assistant. Your task is to analyze the provided HTML content, optimize it by removing unused tags, scripts, and redundant code, while preserving the core structure.' +
          'Do not add any other text or comments to the output. Just output the optimized HTML code.',
      },
      {
        role: 'user',
        content: `Please optimize the following HTML content:\n\n${html}`,
      },
    ];

    const ai = c.env.AI;
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 2048,
      // stream: true,
    });

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

export default app;
