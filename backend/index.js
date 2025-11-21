import express from "express";
import routes from "./routes.js";
import cors from "cors";

const app = express();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://rare-acceptance-production.up.railway.app";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("", routes);

export default app;
