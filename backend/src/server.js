import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import applicationsRouter from "./routes/applications.js";
import authRouter from "./routes/auth.js";
import improvementPlansRouter from "./features/improvements/index.js";
import jobsRouter from "./routes/jobs.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/improvement-plans", improvementPlansRouter);

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
  app.listen(port, () => {
    console.log(`Hiring API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
