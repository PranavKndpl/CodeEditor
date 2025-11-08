import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from './redisClient.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '1mb' }));

// GET endpoint: check for job result
app.get('/result/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // --- NEW LOGGING ---
    console.log(`[Server 1] Polling for job: ${jobId}`);

    const output = await redisClient.get(`result:${jobId}`);

    if (!output) {
      // --- NEW LOGGING ---
      console.log(`[Server 1] Result for ${jobId}: NOT FOUND (Pending)`);
      return res.json({ jobId, status: 'pending' });
    }

    // --- NEW LOGGING ---
    console.log(`[Server 1] Result for ${jobId}: FOUND! Sending to client.`);
    res.json({ jobId, status: 'done', output });

  } catch (err) {
    console.error('[Server 1] Error fetching result:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// POST endpoint: submit Python code job
app.post('/run-python', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    const jobId = uuidv4();
    const job = { jobId, code };

    await redisClient.lPush('jobQueue', JSON.stringify(job));
    
    // --- NEW LOGGING ---
    console.log(`[Server 1] New job created: ${jobId}`);
    res.json({ jobId });

  } catch (err) {
    console.error('[Server 1] Error submitting job:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Start server
const port = 3001;
app.listen(port, () => {
  console.log(`Backend API listening at http://localhost:${port}`);
});
// GET endpoint: fetch result for a given jobId
// app.get('/result/:jobId', async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const output = await redisClient.get(`result:${jobId}`);

//     if (!output) {
//       return res.json({ jobId, status: 'pending' });
//     }

//     res.json({ jobId, status: 'done', output });
//   } catch (err) {
//     console.error('Error fetching result:', err);
//     res.status(500).json({ error: err.message || 'Server error' });
//   }
// });