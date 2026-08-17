import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";

// routes
import authRoutes from "./routes/auth.routes.ts";
import gameRoutes from "./routes/game.routes.ts";
import healthRoutes from "./routes/health.routes.ts";
import userRoutes from "./routes/user.routes.ts";

const app: Express = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/game", gameRoutes);

app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});

export default app;
