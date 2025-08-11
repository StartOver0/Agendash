module.exports = function (agenda) {
  agenda.define("send email", async (job) => {
    const { to, subject, body, counter } = job.attrs.data

    console.log(
      `[EmailJob: ${new Date().toISOString()}] Sending email to: ${to}`
    )
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${body}`)
    console.log(`This is the ${counter}th time this job has run`)

    // Simulate sending an email

    // Increment the counter for the next run
    const nextCounter = counter + 1

    // Save the updated counter to the job for the next run
    job.attrs.data.counter = nextCounter
    await job.save() // Save the job with updated counter value
  })

  // Schedule the job to run every 5 seconds
  agenda.every("5 seconds", "send email", {
    to: "user@example.com",
    subject: "Hello from Agenda",
    body: "This is a test email.",
    counter: 1, // Start the counter from 1
  })
}
