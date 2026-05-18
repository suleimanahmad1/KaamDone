const cors = require("cors");

const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

function getAllowedOrigins() {
  const fromEnv = (process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...LOCAL_ORIGINS, ...fromEnv])];
}

function corsOptions() {
  const allowed = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  };
}

module.exports = { corsMiddleware: cors(corsOptions()), getAllowedOrigins };
