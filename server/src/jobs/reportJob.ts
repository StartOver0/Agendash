import { Agenda, Job } from '@hokify/agenda';

interface ReportJobData {
  reportType: string;
}

export default function reportJob(agenda: Agenda): void {
  agenda.define<ReportJobData>('generate report', async (job: Job<ReportJobData>) => {
    const { reportType } = job.attrs.data;
    console.log(`[ReportJob] Generating report: ${reportType}`);
    // Simulate report generation here (e.g., create PDF, send email, etc.)
  });

  // Avoid rescheduling the same job if already present
  agenda.on('ready', async () => {
    const jobs = await agenda.jobs({ name: 'generate report' });
    if (jobs.length === 0) {
      await agenda.every('0 9 * * 1', 'generate report', {
        reportType: 'weekly-summary',
      });
    }
  });
}
