import { Agenda, Job } from 'agenda';

interface CleanupJobData {
  olderThanDays: number;
}

export default function cleanupJob(agenda: Agenda): void {
  agenda.define<CleanupJobData>('cleanup database', async (job: Job<CleanupJobData>) => {
    const { olderThanDays } = job.attrs.data;
    console.log(`[CleanupJob] Cleaning records older than ${olderThanDays} days...`);
    // Simulate database cleanup logic here
  });

  // Avoid duplicate scheduling
  agenda.on('ready', async () => {
    const jobs = await agenda.jobs({ name: 'cleanup database' });
    if (jobs.length === 0) {
      await agenda.every('0 0 * * *', 'cleanup database', {
        olderThanDays: 30,
      });
    }
  });
}
