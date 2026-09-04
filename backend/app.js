const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

dotenv.config();

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Build allowed origins list from env (comma-separated) + always allow localhost for dev
const buildAllowedOrigins = () => {
  const origins = ["http://localhost:5173", "http://localhost:3000"];
  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl) {
    clientUrl.split(",").forEach((url) => {
      const trimmed = url.trim();
      if (trimmed && !origins.includes(trimmed)) origins.push(trimmed);
    });
  }
  return origins;
};

const allowedOrigins = buildAllowedOrigins();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, mobile apps, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts from this IP, please try again later.",
});

app.use(generalLimiter);
app.use("/api/auth", authLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KnowledgeVault backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
