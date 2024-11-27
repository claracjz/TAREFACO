import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/TaskList.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

type Task = {
  id: number;
  nome: string;
  custo: number;
  dataLimite: string;
};

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({ nome: "", custo: "", dataLimite: "" });
    const [error, setError] = useState("");
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingValues, setEditingValues] = useState<Partial<Task>>({}); 

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get("/api");
                setTasks(response.data);
            } catch (error) {
               console.error("Erro ao buscar tarefa:", error);
            }
        };

        fetchTasks();
    }, []);

    const handleAddTask = async () => {
        const { nome, custo, dataLimite } = newTask;

        if (!nome || !custo || !dataLimite) {
            setError("Preencha todos os campos.");
            return;
        }

        try {
            const response = await fetch("/api/task", {
             method: "POST",
             headers: {
                "Content-Type": "application/json",
             },
             body: JSON.stringify({
                nome,
                custo: Number(custo),
                dataLimite,
             }),
            });

            if (!response.ok) {

                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao adicionar tarefa.");
            }

                const addedTask = await response.json();
                setTasks((prevTasks) => [...prevTasks, addedTask])
                setNewTask({ nome: "", custo: "", dataLimite: "" });
                setError("");
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Erro ao adicionar tarefa.");
                }
        }
    }
    
    

    const startEdit = (task: Task) => {
       setEditingTaskId(task.id);
       setEditingValues({
        nome: task.nome,
        custo: task.custo,
        dataLimite: task.dataLimite,
       });
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setEditingValues({});
    };

    const saveEdit = async (id: number) => {
        try {
            const existingTask = tasks.find(
                (task) => task.nome === editingValues.nome && task.id !== id
            );

            if (existingTask) {
                alert("Já existe uma tarefa com este nome. Escolha outro.");
                return;
            }

            const response = await axios.put(`/api/task/${id}`, editingValues);

            setTasks((prevTasks) => 
            prevTasks.map((task) => 
            task.id === id ? { ...task, ...response.data } : task
            )
        );
        cancelEdit();

        alert("Tarefa atualizada com sucesso!");
        } catch (error) {
           console.error("Erro ao atualizar tarefa:", error); 
        }
    };


    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir esta tarefa?");
        if (confirmDelete) {
            try {
                await api.delete(`/api/task/${id}`);
                setTasks(tasks.filter((task) => task.id !== id));  
                alert("Tarefa excluída com sucesso!");
              } catch (error) {
                 console.error("Erro ao excluir tarefa:", error) 
                 alert("Erro ao excluir tarefa. Por favor, tente novamente.");
              }
          }
        };

        return (
            <div className="task-list-container">
                <h1 className="task-list-title">TODO</h1>
                <table className="task-list-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Custo</th>
                            <th>Data Limite</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr 
                        key={task.id}
                        className={task.custo >= 1000 ? "task-high-cost" : ""}
                        >
                         {editingTaskId === task.id ? (
                            <>
                            <td>
                                <input 
                                type="text" 
                                value={editingValues.nome || ""}
                                onChange={(e) => 
                                    setEditingValues({ ...editingValues, nome: e.target.value})
                                }
                                />
                            </td>
                            <td>
                                <input 
                                type="number"
                                value={editingValues.custo || ""}
                                onChange={(e) => 
                                    setEditingValues({ ...editingValues, custo: Number(e.target.value)})
                                }
                                />
                            </td>
                            <td>
                                <input 
                                type="date" 
                                value={
                                    editingValues.dataLimite
                                    ? editingValues.dataLimite.split("T")[0]
                                    : ""
                                }
                                onChange={(e) => 
                                    setEditingValues({ ...editingValues, dataLimite: e.target.value})
                                }
                                />
                            </td>
                            <td>
                                <button 
                                className="task-button task-save-button"
                                onClick={() => saveEdit(task.id)}
                                >
                                  Salvar
                                </button>
                                <button
                                className="task-button task-cancel-button"
                                onClick={cancelEdit}
                                >
                                    Cancelar
                                </button>
                            </td>
                            </>
                         ) : (
                            <>
                         <td>{task.nome}</td>
                         <td>R$ {task.custo.toFixed(2)}</td>
                         <td>{new Date(task.dataLimite).toLocaleString()}</td>   
                        <td>
                            <button
                            className="task-button task-edit-button"
                            onClick={() => startEdit(task)}
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                            className="task-button task-delete-button"
                            onClick={() => handleDelete(task.id)}
                            >
                            <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </td>
                        </>
                    )}
                    </tr>
                ))}
                </tbody>
                </table>
                <div className="add-task">
                    <input
                    type="text"
                    placeholder="Nome da tarefa"
                    value={newTask.nome}
                    onChange={(e) => setNewTask({ ...newTask, nome: e.target.value })}
                    />
                    <input
                    type="number"
                    placeholder="Custo"
                    value={newTask.custo}
                    onChange={(e) => setNewTask({ ...newTask, custo: e.target.value })}
                    />
                    <input
                    type="date"
                    placeholder="Data Limite"
                    value={newTask.dataLimite}
                    onChange={(e) => setNewTask({ ...newTask, dataLimite: e.target.value })}
                    />
                    <button onClick={handleAddTask}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
        )
}

export default TaskList;