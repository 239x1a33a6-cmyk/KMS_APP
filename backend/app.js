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

// Build allowed origins: hardcoded known URLs + any additional from CLIENT_URL env var
const buildAllowedOrigins = () => {
  const origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://kms-app.vercel.app", // production frontend — always allowed
  ];
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

const corsOptions = {
  origin: (origin, callback) => {
    // allow no-origin requests (curl, Render health checks, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight for all routes

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
  skip: (req) => req.path === "/api/health",
});

app.use(generalLimiter);

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
