import express from "express";
import routes from "./routes.js";
import cors from "cors";

const app = express();

const FRONTEND_URL = "https://rare-acceptance-production.up.railway.app";

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.post("/login", (req, res) => {
  res.json({ message: "Login route works" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
