import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const here = fileURLToPath(new URL('.', import.meta.url));
dotenvConfig({ path: resolve(here, '../../.env') });
dotenvConfig();
import cors from 'cors';
import { planRouter } from './routes/plan.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.use('/api', planRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: 'sonnet' });
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
