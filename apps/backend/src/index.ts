import { serve } from '@hono/node-server';
import { config } from 'dotenv';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import c = require('config');

config();

const app = new Hono()
app.use('*', cors());

const port = process.env.PORT || "3000";
serve({
  fetch: app.fetch,
  port: parseInt(port),
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

