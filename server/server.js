require("dotenv").config();
const express = require("express");
const { connectDatabase } = require("./config/database");
const { corsMiddleware, getAllowedOrigins } = require("./config/cors");
const { BODY_LIMIT } = require("./config/bodyLimit");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");
const { startDeadlineReminderScheduler } = require("./utils/deadlineReminders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(corsMiddleware);
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ limit: BODY_LIMIT, extended: true }));

app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message:
        "Upload too large. Use up to 5 files, 10 MB each. Restart the API server if this persists after updating.",
      data: null,
    });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Each file must be 10 MB or smaller.",
      data: null,
    });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Too many files (maximum 5 per task).",
      data: null,
    });
  }
  next(err);
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();
  } catch (err) {
    console.error("Failed to start server:", err.message.split("\n")[0]);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`CORS origins: ${getAllowedOrigins().join(", ")}`);
    console.log(`JSON body limit: ${BODY_LIMIT}`);
    console.log("Auth: POST /api/auth/register, /login, /forgot-password, /reset-password");
    startDeadlineReminderScheduler();
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other server or run:`);
      console.error(`  Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`);
      process.exit(1);
    }
    throw err;
  });
}

startServer();
