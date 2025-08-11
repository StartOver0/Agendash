module.exports = function (agenda) {
  agenda.define("cleanup database", async (job) => {
    const { olderThanDays } = job.attrs.data
    console.log(
      `[CleanupJob] Cleaning records older than ${olderThanDays} days...`
    )
    // Simulate database cleanup
  })

  // Run once every day at midnight
  agenda.every("0 0 * * *", "cleanup database", {
    olderThanDays: 30,
  })
}
