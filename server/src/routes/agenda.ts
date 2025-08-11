import { Elysia, t } from 'elysia';
import { AgendaController } from '../controllers/agenda';
import { makeGetJobs, makeCreateJob, makeDeleteJobs, makeGetJobStats, makePurgeJobs, makeRetryJob, makeUpdateJob } from '../controllers/agenda';
import { Agenda } from '@hokify/agenda';

export const Agendash = (agenda: Agenda) => {
  const controller = {
    getJobs: makeGetJobs(agenda),
    createJob: makeCreateJob(agenda),
    deleteJobs: makeDeleteJobs(agenda),
    getJobStats: makeGetJobStats(agenda),
    purgeJobs: makePurgeJobs(agenda),
    retryJob: makeRetryJob(agenda),
    updateJob: makeUpdateJob(agenda)
  };
  
  const app = new Elysia({ prefix: '/api' })// Get all jobs with filtering
    .get('/jobs', async ({ query }) => {
      try {
        const parsedQuery = query.q ? JSON.parse(query.q) : {};
        const result = await controller.getJobs({
          query: parsedQuery,
          page: Number(query.page || 1),
          limit: Number(query.limit || 50),
          sort: query.sort ? JSON.parse(query.sort) : { nextRunAt: 1 }
        });
        return { success: true, ...result };
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }, {
      query: t.Object({
        q: t.Optional(t.String()),
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        sort: t.Optional(t.String())
      })
    })

    // Get a single job by ID
    .get('/jobs/:id', async ({ params }) => {
      try {
        const jobs = await controller.getJobs({ query: { _id: params.id } });
        if (!jobs.data.length) {
          return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });
        }
        return { success: true, job: jobs.data[0] };
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }, {
      params: t.Object({ id: t.String() })
    })

    // Create job
    .post('/jobs', async ({ body }) => {
      try {
        const result = await controller.createJob(body);
        return { success: true, ...result };
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }, {
      body: t.Object({
        name: t.String(),
        data: t.Optional(t.Any()),
        schedule: t.Optional(t.Union([t.String(), t.Date()])),
        priority: t.Optional(t.Union([
          t.Literal('low'),
          t.Literal('normal'),
          t.Literal('high'),
          t.Number()
        ])),
        repeatInterval: t.Optional(t.String()),
        timezone: t.Optional(t.String()),
        skipImmediate: t.Optional(t.Boolean())
      })
    })

    // Delete jobs (single or bulk)
    .delete('/jobs', async ({ body }) => {
      try {
        const result = await controller.deleteJobs(
          body.ids ? { _id: { $in: body.ids } } : body.query
        );
        return { success: true, ...result };
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }, {
      body: t.Object({
        ids: t.Optional(t.Array(t.String())),
        query: t.Optional(t.Any())
      })
    })

    // Retry failed job
    .post('/jobs/:id/retry', async ({ params }) => {
      try {
        const result = await controller.retryJob(params.id);
        return { success: true, ...result };
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }, {
      params: t.Object({ id: t.String() })
    })

    // Update job
    .patch('/jobs/:id', async ({ params, body }) => {
      try {
        const result = await controller.updateJob(params.id, body);
        return { success: true, ...result };
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }, {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String()),
        data: t.Optional(t.Any()),
        schedule: t.Optional(t.Union([t.String(), t.Date()])),
        priority: t.Optional(t.Number()),
        disabled: t.Optional(t.Boolean())
      })
    })

    

    // Get statistics
    .get('/stats', async () => {
      try {
        const stats = await controller.getJobStats();
        return { success: true, ...stats };
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    })

    // Delete single job by ID
.delete('/jobs/:id', async ({ params }) => {
  try {
    const result = await controller.deleteJobs({ _id: params.id });
    return { success: true, ...result };
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}, {
  params: t.Object({ id: t.String() })
})
    // Purge old jobs
    .delete('/jobs/purge', async ({ query }) => {
      try {
        const result = await controller.purgeJobs(Number(query.days || 7));
        return { success: true, ...result };
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }, {
      query: t.Object({
        days: t.Optional(t.Numeric())
      })
    })


    // Error handling
    .onError(({ code, error }) => {
      return new Response(JSON.stringify({
        error: "error.message"
      }), {
        status: code === 'NOT_FOUND' ? 404 : 400,
        headers: { 'Content-Type': 'application/json' }
      });
    });

  return app;
};

export type AgendaRoutes = ReturnType<typeof Agendash>;