import { serve } from '@hono/node-server';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createDataStream, generateId, streamText, wrapLanguageModel } from 'ai';
import { config } from 'dotenv';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { stream } from "hono/streaming";
import { getLangfuse, initTrace } from './trace';
import c = require('config');
import { LoggingMiddleware } from './middlewares/Logging';
import { hookSystem, World } from '@easyagent/lib';
import { plugins } from '../config/plugin';

config();

const app = new Hono()
app.use('*', cors());
initTrace();

const openrouter = createOpenRouter({
  apiKey: c.get('model.api_key'),
})

// let model = wrapLanguageModel({
//   model: openrouter.chat(c.get('model.name')),
//   middleware: LoggingMiddleware,
// })
let model = openrouter.chat(c.get('model.name'))

const world = new World(model)
// init agent
for(const agent of plugins){
  const a = new agent(world)
  a.setup({}, {})
  console.log("registered", agent.AgentName)
}


app.post('/stream-data', async c => {
  const { messages, id } = await c.req.json()

  if (!id) {
    throw new Error('id is required')
  }

  const traceID = id;
  getLangfuse()?.trace({
    id: traceID,
    name: 'chat',
  });
  const systemPrompt = hookSystem.run('onSystemPromptBuild', `You're an intelligent assistant.Note that your output will be presented by the markdown parser, so be careful when you output.\n`, {
    model,
    traceID: traceID,
  })

  const tools = hookSystem.run('onToolBuild', {}, {
    model,
    traceID: traceID,
  })

  // immediately start streaming the response
  const dataStream = createDataStream({
    execute: async dataStreamWriter => {
      const area = world.getArea(traceID)

      area.content = {
        model,
        system: systemPrompt,
        messages,
        tools,
        // toolCallStreaming: true,
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            langfuseTraceId: traceID,
            langfuseUpdateParent: false,
          }
        },
        onFinish: () => world.removeArea(traceID)
      }

      const result = streamText(area.content);
      result.mergeIntoDataStream(dataStreamWriter);
      getLangfuse()?.flushAsync();
    },
    onError: error => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });

  // Mark the response as a v1 data stream:
  c.header('X-Vercel-AI-Data-Stream', 'v1');
  c.header('Content-Type', 'text/plain; charset=utf-8');

  return stream(c, async stream => {
    await stream.pipe(dataStream.pipeThrough(new TextEncoderStream()))
  });
});

const port = process.env.PORT || "3000";
serve({
  fetch: app.fetch,
  port: parseInt(port),
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});