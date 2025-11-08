// This is your new worker.js

import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { redisClient } from './redisClient.js'; // Imports the client from Part 1

const docker = new Docker();

async function runWorker() {
    console.log('🔒 Worker started and waiting for jobs...');

    while (true) {
        try {
            const jobData = await redisClient.rPop('jobQueue'); 
            if (!jobData) {
                await new Promise(r => setTimeout(r, 500)); 
                continue;
            }

            let job;
            try {
                job = JSON.parse(jobData);
            } catch {
                console.error('⚠️ Invalid job data:', jobData);
                continue;
            }

            const { jobId, code } = job;
            console.log(`📦 Picked job ${jobId}`);

            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codesandbox-'));
            const scriptPath = path.join(tempDir, 'script.py');
            fs.writeFileSync(scriptPath, code);
            console.log(`   Running code: ${code.substring(0, 20)}...`);

            let container = null; 

            try {
                container = await docker.createContainer({
                    Image: 'python:3.11-slim',
                    Cmd: ['python', '/code/script.py'],
                    HostConfig: {
                        Binds: [`${scriptPath}:/code/script.py:ro`],
                        NetworkMode: 'none',
                        Memory: 128 * 1024 * 1024,
                        CpuQuota: 50000,
                        PidsLimit: 32,
                        AutoRemove: false, // Correctly set to false
                        SecurityOpt: ['no-new-privileges'],
                        CapDrop: ['ALL'],
                    },
                    User: '1000:1000',
                    Tty: false,
                });

                await container.start();
                console.log(`   Container started for job ${jobId}`);

                try {
                    await container.wait({ timeout: 5000 });
                } catch (timeoutErr) {
                    console.log(`⏰ Job ${jobId} timed out. Killing container.`);
                    await container.kill();
                    await container.remove(); 
                    
                    // --- FIX 1 (v4 SYNTAX) ---
                    await redisClient.set(`result:${jobId}`, '⏰ Execution timed out', { EX: 300 });
                    
                    continue;
                }

                const output = await container.logs({ stdout: true, stderr: true });
                const outputStr = output.toString('utf-8').replace(/[\x00-\x1F\x7F-\x9F]/g, '');

                await container.remove(); 

                // --- FIX 2 (v4 SYNTAX) ---
                await redisClient.set(`result:${jobId}`, outputStr, { EX: 300 });
                
                console.log(`✅ Job ${jobId} done`);

            } catch (err) {
                console.error(`❌ Job ${jobId} error:`, err.message);
                if (container) {
                    try { await container.remove(); } catch (e) { /* ignore */ }
                }

                // --- FIX 3 (v4 SYNTAX) ---
                await redisClient.set(`result:${jobId}`, `❌ Docker Error: ${err.message}`, { EX: 300 });

            } finally {
                fs.unlinkSync(scriptPath);
                fs.rmSync(tempDir, { recursive: true, force: true });
            }

        } catch (err) {
            console.error('Worker loop error:', err.message);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

runWorker().catch(err => console.error('Worker failed to start:', err));