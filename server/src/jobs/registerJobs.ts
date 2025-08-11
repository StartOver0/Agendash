import { Agenda } from '@hokify/agenda';
import emailJob from './emailJob';
import cleanupJob from './cleanupJob';
import reportJob from './reportJob';

export default function registerJobs(agenda: Agenda): void {
  emailJob(agenda);
  cleanupJob(agenda);
  reportJob(agenda);
}
