const { Agenda } = require("agenda")

// MongoDB connection URI
const mongoConnectionString =
  "mongodb+srv://bankai:1234567890@cluster0.8mdvp.mongodb.net/agenda-demo?retryWrites=true&w=majority&appName=Cluster0"

const agenda = new Agenda({
  db: {
    address: mongoConnectionString,
    collection: "agendaJobs",
  },
  processEvery: "30 seconds", // Add this for better job processing
})

agenda.on("processEvery", async (interval) => {
  console.log(
    `[${new Date().toISOString()}] Agenda polling database (processEvery: ${interval})`
  )
})
// Error handling
agenda.on("error", (err) => {
  console.error("Agenda error:", err)
})

// Graceful shutdown
function graceful() {
  agenda.stop(() => {
    console.log("Agenda stopped gracefully")
    process.exit(0)
  })
}

process.on("SIGTERM", graceful)
process.on("SIGINT", graceful)

// Wait for MongoDB connection
agenda.on("ready", () => {
  console.log("Agenda connected to MongoDB!")
})

// Load jobs after connection is successful
agenda.once("ready", async () => {
  try {
    await require("./jobs")(agenda)
    console.log("Jobs loaded successfully")
  } catch (err) {
    console.error("Failed to load jobs:", err)
  }
})

module.exports = agenda
