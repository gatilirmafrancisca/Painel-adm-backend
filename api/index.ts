import express, {Request, Response} from "express"
import cors from "cors"
import dotenv from "dotenv"
import database from "./database/configdb.js"
import userRoute from "./routes/user.route.js";
import protectedRoute from "./routes/protected.route.js";

dotenv.config();

// App
const app = express();

// Database
database.connect();

app.use(express.json());
app.use(cors());

/** routes **/ 

app.use("/", userRoute);
app.use("/protected", protectedRoute);

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "App Working" });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}/`);
  });