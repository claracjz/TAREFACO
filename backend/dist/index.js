import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes";
const app = express();
app.use(cors());
app.use(express.json());
console.log("Rotas carregadas: /api");
app.use("/api", taskRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
