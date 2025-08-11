import { Agenda, Job } from 'agenda';

interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  counter: number;
}

export default function emailJob(agenda: Agenda): void {
  agenda.define<EmailJobData>('send email', async (job: Job<EmailJobData>) => {
    const { to, subject, body, counter } = job.attrs.data;

    console.log(
      `[EmailJob: ${new Date().toISOString()}] Sending email to: ${to}`
    );
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log(`This is the ${counter}th time this job has run`);

    // Increment counter for the next run
    job.attrs.data.counter = counter + 1;
    await job.save();
  });

  // Avoid scheduling duplicate jobs
  agenda.on('ready', async () => {
    const jobs = await agenda.jobs({ name: 'send email' });
    if (jobs.length === 0) {
      await agenda.every('5 seconds', 'send email', {
        to: 'user@example.com',
        subject: 'Hello from Agenda',
        body: 'This is a test email.',
        counter: 1,
      });
    }
  });
}
