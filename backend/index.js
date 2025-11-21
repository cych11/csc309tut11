// backend/index.js
import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
}));

app.options("*", cors());

app.use(express.json());
app.use("/", routes);

export default app;
