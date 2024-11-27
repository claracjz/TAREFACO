var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();
console.log(typeof router);
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield prisma.task.findMany({
            orderBy: { ordem: "asc" },
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao buscar tarefas" });
    }
}));
router.post("/task", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, custo, dataLimite } = req.body;
    const lastTask = yield prisma.task.findFirst({
        orderBy: { ordem: "desc" },
        select: { ordem: true },
    });
    const ordem = lastTask ? lastTask.ordem + 1 : 1;
    try {
        const task = yield prisma.task.create({
            data: {
                nome,
                custo,
                dataLimite: new Date(dataLimite),
                ordem,
            }
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao criar tarefa" });
    }
}));
router.put("/task/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Requisição recebida no PUT /task/:id");
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    const { id } = req.params;
    const { nome, custo, dataLimite } = req.body;
    try {
        const existingTask = yield prisma.task.findFirst({
            where: {
                nome,
                NOT: {
                    id: Number(id),
                },
            }
        });
        if (existingTask) {
            return res.status(400).json({ error: "Já existe uma tarefa com este nome" });
        }
        const updateTask = yield prisma.task.update({
            where: { id: Number(id) },
            data: {
                nome,
                custo,
                dataLimite: new Date(dataLimite),
            },
        });
        res.json(updateTask);
    }
    catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        res.status(500).json({ error: "Erro ao atualizar tarefa" });
    }
}));
export default router;
