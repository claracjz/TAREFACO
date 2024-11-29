import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();


console.log(typeof router);

router.get("/", async (req: Request, res: Response) => {
    try {
    const tasks = await prisma.task.findMany({
        orderBy: { ordem: "asc" },
    });
    res.json(tasks);
} catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefas" });  
}
});

router.post("/task", async (req: Request, res: Response) => {
    const { nome, custo, dataLimite } = req.body;

    const existingTask = await prisma.task.findFirst({
        where: { nome },
    });

    if (existingTask) {
        return res.status(400).json({ error: "Já existe uma tarefa com este nome" });
    }

    try {
    const lastTask = await prisma.task.findFirst({
        orderBy: { ordem: "desc" },
        select: { ordem: true },
    });

    const ordem = lastTask ? lastTask.ordem + 1 : 1;

  
        const newTask = await prisma.task.create({
            data: {
                nome,
                custo,
                dataLimite: new Date(dataLimite),
                ordem,
}
        });
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
       res.status(500).json({ error: "Erro ao criar tarefa" }); 
    }
});

router.put("/task/:id", async (req: Request, res: Response) => {

    console.log("Requisição recebida no PUT /task/:id");
    console.log("Params:", req.params);
    console.log("Body:", req.body);



    const { id } = req.params;
    const { nome, custo, dataLimite } = req.body;

    try {

        const existingTask = await prisma.task.findFirst({
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

        const updateTask = await prisma.task.update({
            where: { id: Number(id) },
            data: {
                nome,
                custo,
                dataLimite: new Date(dataLimite),
            },
        });
        res.json(updateTask);
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        res.status(500).json({ error: "Erro ao atualizar tarefa" });
    }
});

router.put("/task/order", async (req: Request, res: Response) => {
    const { tasks } = req.body;

    if(!Array.isArray(tasks) || tasks.some(task => !task.id || task.ordem === undefined)) {
        return res.status(400).json({ error: "Formato de tarefas inválido" });
    }

    try {
        await prisma.$transaction(
            tasks.map(task =>
                prisma.task.update({
                    where: { id: task.id },
                    data: { ordem: task.ordem },
                })
            )
        )

            res.json({ message: "Ordem das tarefas atualizada com sucesso." })
        } catch (error) {
        console.error("Erro ao atualizar ordem das tarefas:", error);
        res.status(500).json({ error: "Erro ao atualizar ordem das tarefas" });
    }
});

router.delete("/task/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const task = await prisma.task.findUnique({
            where: { id: Number(id) },
        });

        if (!task) {
            return res.status(404).json({ error: "Tarefa não encontrada" });
        }

        await prisma.task.delete({
            where: { id: Number(id) },
        });

        res.json("Tarefa excluída com sucesso.");
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar tarefa" });
    }
});

export default router;