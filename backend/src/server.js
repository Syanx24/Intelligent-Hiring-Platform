import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import apiRouter from "./routes/index.js";
import ImprovementPlan from "./features/improvement/schema.js";

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
  app.listen(port, () => {
    console.log(`Hiring API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
