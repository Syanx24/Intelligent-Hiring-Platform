import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import apiRouter from "./routes/index.js";
import ImprovementPlan from "./features/improvement/schema.js";

const app = express();
app.set("trust proxy", 1);
const port = Number(process.env.PORT) || 5000;

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "4mb" }));
app.use("/api", apiRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required. Copy .env.example to .env and configure it.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  // Remove the old unique number index from before idea numbers became display-only.
  await ImprovementPlan.syncIndexes();
  const server = app.listen(port, () => {
    console.log(`Hiring API listening on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Please terminate existing node processes or check for another running instance.`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });

  const gracefulShutdown = () => {
    server.close(() => {
      mongoose.connection.close(false).finally(() => {
        process.exit(0);
      });
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
