import express, {Request, Response} from "express"
import cors from "cors"

const app = express();
app.use(express.json());

app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.send({message: "App Working"});
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}/`);
  });