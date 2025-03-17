import { Hono } from 'hono'
import { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const ai = c.env.AI;
  const messages = [
    { role: 'system', content: 'You are a friendly assistant' },
    {
        role: 'user',
        content: 'What is the origin of the phrase Hello, World',
      },
  ];
  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', { messages });

  return c.json(response)
})

export default app