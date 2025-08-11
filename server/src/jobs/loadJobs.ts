
import { Agenda } from '@hokify/agenda';
import registerJobs from './registerJobs'; // assumes jobs/index.ts exports default function

export function loadJobsAfterConnection(agenda: Agenda): void {
  agenda.once('ready', async () => {
    try {
      await registerJobs(agenda);
      console.log('Jobs loaded successfully');
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  });
}
