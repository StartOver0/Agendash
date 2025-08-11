import { Agenda } from '@hokify/agenda';
import { ObjectId } from '@hokify/agenda/node_modules/bson';

// Types
export interface JobResponse {
  id: string;
  name: string;
  data: any;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
  failedAt: Date | null;
  priority: number;
  disabled: boolean;
  repeating?: {
    interval?: string;
    timezone?: string;
  };
}

// Formatting utility
export const formatJob = (job: any): JobResponse => ({
  id: job.attrs._id.toString(),
  name: job.attrs.name,
  data: job.attrs.data,
  nextRunAt: job.attrs.nextRunAt,
  lastRunAt: job.attrs.lastRunAt,
  failedAt: job.attrs.failedAt,
  priority: job.attrs.priority,
  disabled: job.attrs.disabled,
  ...(job.attrs.repeatInterval && {
    repeating: {
      interval: job.attrs.repeatInterval,
      timezone: job.attrs.repeatTimezone
    }
  })
});

// 1. Get Jobs
export const makeGetJobs = (agenda: Agenda) => async ({
  query = {},
  page = 1,
  limit = 50,
  sort = { nextRunAt: 1 }
}: {
  query?: any;
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}) => {
  const skip = (page - 1) * limit;
  // Fetch all jobs matching the query and sort
  const jobs = await agenda.jobs(query, sort);
  const collection = agenda.db.collection;
  const total = await collection.countDocuments(query);

  // Paginate in-memory (for small datasets)
  const paginatedJobs = jobs.slice(skip, skip + limit);

  return {
    data: paginatedJobs.map(formatJob),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// 2. Create Job
export const makeCreateJob = (agenda: Agenda) => async ({
  name,
  data,
  schedule,
  priority,
  repeatInterval,
  timezone,
  skipImmediate = false
}: {
  name: string;
  data?: any;
  schedule?: string | Date;
  priority?: 'low' | 'normal' | 'high' | number;
  repeatInterval?: string;
  timezone?: string;
  skipImmediate?: boolean;
}) => {
  const job = agenda.create(name, data);

  if (schedule) job.schedule(schedule);
  if (priority) job.priority(priority);
  if (repeatInterval) job.repeatEvery(repeatInterval, { timezone, skipImmediate });

  await job.save();
  return formatJob(job);
};

// 3. Delete Jobs
export const makeDeleteJobs = (agenda: Agenda) => async (filter: any) => {
  const collection = agenda.db.collection;

  // ✅ Convert _id to ObjectId if it's a string
  if (typeof filter._id === 'string') {
    filter._id = new ObjectId(filter._id);
  }

  // ✅ Also support array of IDs
  if (filter._id?.$in) {
    filter._id.$in = filter._id.$in.map((id: string) => new ObjectId(id));
  }

  console.log('Deleting jobs with filter:', filter);

  const job = await collection.findOne(filter); // should now return actual job
  console.log('Job to be deleted:', job);

  const result = await collection.deleteMany(filter);
  return { deletedCount: result.deletedCount };
};


// 4. Retry Job
export const makeRetryJob = (agenda: Agenda) => async (id: string) => {
  const jobs = await agenda.jobs({
    _id: new ObjectId(id),
    failedAt: { $exists: true }
  });

  if (!jobs.length) throw new Error('No failed job found with this ID');

  const job = jobs[0];
  job.attrs.failedAt = undefined;
  job.attrs.lastFinishedAt = undefined;
  await job.schedule('now').save();
  return formatJob(job);
};

export const makeUpdateJob = (agenda: Agenda) => async (
  id: string,
  updates: {
    name?: string;
    data?: any;
    schedule?: string | Date;
    priority?: number;
    disabled?: boolean;
  }
) => {
  const jobs = await agenda.jobs({ _id: new ObjectId(id) }); // Use string, not ObjectId
  if (!jobs.length) throw new Error('Job not found');

  const job = jobs[0];
  if (updates.name !== undefined) job.attrs.name = updates.name;
  if (updates.data !== undefined) job.attrs.data = updates.data;
  if (updates.schedule !== undefined) job.schedule(updates.schedule);
  if (updates.priority !== undefined) job.attrs.priority = updates.priority;
  if (updates.disabled !== undefined) job.attrs.disabled = updates.disabled;

  await job.save();
  return formatJob(job);
};

// 6. Get Stats
export const makeGetJobStats = (agenda: Agenda) => async () => {
  const collection = agenda.db.collection;
  const total = await collection.countDocuments({});
  const scheduled = await collection.countDocuments({ nextRunAt: { $exists: true, $ne: null } } as any);
  const completed = await collection.countDocuments({ lastRunAt: { $exists: true, $ne: null }, failedAt: null } as any);
  const failed = await collection.countDocuments({ failedAt: { $exists: true, $ne: null } } as any);
  const queued = await collection.countDocuments({ lockedAt: { $exists: true, $ne: null }, lastRunAt: null } as any);

  return {
    total,
    scheduled,
    completed,
    failed,
    queued,
    successRate: total > 0 ? ((completed / total) * 100).toFixed(2) : '100'
  };
};

// 7. Purge Jobs
export const makePurgeJobs = (agenda: Agenda) => async (daysOld: number = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const collection = agenda.db.collection;
  const numRemoved = await collection.deleteMany({
    lastRunAt: { $exists: true, $lt: cutoffDate },
    failedAt: null
  });

  return { deletedCount: numRemoved.deletedCount };
};

export type AgendaController = {
  getJobs: ReturnType<typeof makeGetJobs>;
  createJob: ReturnType<typeof makeCreateJob>;
  deleteJobs: ReturnType<typeof makeDeleteJobs>;
  retryJob: ReturnType<typeof makeRetryJob>;
  updateJob: ReturnType<typeof makeUpdateJob>;
  getJobStats: ReturnType<typeof makeGetJobStats>;
  purgeJobs: ReturnType<typeof makePurgeJobs>;
};