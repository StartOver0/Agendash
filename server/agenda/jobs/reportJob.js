module.exports = function (agenda) {
  agenda.define("generate report", async (job) => {
    const { reportType } = job.attrs.data
    console.log(`[ReportJob] Generating report: ${reportType}`)
    // Simulate report generation
  })

  // Run every Monday morning at 9:00 AM
  agenda.every("0 9 * * 1", "generate report", {
    reportType: "weekly-summary",
  })
}
