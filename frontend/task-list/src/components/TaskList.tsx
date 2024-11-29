import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/TaskList.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DropResult } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

type Task = {
  id: number;
  nome: string;
  custo: number;
  dataLimite: string;
  ordem: number;
};

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({ nome: "", custo: "", dataLimite: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingValues, setEditingValues] = useState<Partial<Task>>({}); 

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get("/");
                const sortedTasks = response.data.sort((a: Task, b: Task) => a.ordem - b.ordem);
                setTasks(sortedTasks);
            } catch (error) {
               console.error("Erro ao buscar tarefa:", error);
            }
        };

        fetchTasks();
    }, []);

        const handleOnDragEnd = async (result: DropResult) => {
            if (!result.destination) return;
        
            const reorderedTasks = Array.from(tasks);
            const [movedTask] = reorderedTasks.splice(result.source.index, 1);
            reorderedTasks.splice(result.destination.index, 0, movedTask);

         setTasks(reorderedTasks);

         const updateTasks = reorderedTasks.map((task, index) => ({
            ...task,
            ordem: index,
         }));

         try {
            await api.put("/task/order", { tasks: updateTasks })
         } catch (error) {
            console.error("Erro ao atualizar ordem das tarefas:", error);
         }
        }


    

    const handleAddTask = async () => {
        const { nome, custo, dataLimite } = newTask;

        if (!nome || !custo || !dataLimite) {
            setError("Preencha todos os campos.");
            return;
        }

        const isDuplicate = tasks.some((task) => task.nome === nome);
        if (isDuplicate) {
        setError("Já existe uma tarefa com esse nome.");
        return;
    }

        try {
            const response = await api.post("/task", {
                nome,
                custo: parseFloat(custo),
                dataLimite,
              });

                setTasks((prevTasks) => [...prevTasks, response.data])
                setNewTask({ nome: "", custo: "", dataLimite: "" });
                setError("");
            } catch (error) {
                    console.error("Erro ao adicionar tarefa:", error);
                    setError("Erro ao adicionar tarefa. Por favor, tente novamente.");
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

            const response = await api.put(`/task/${id}`, editingValues);

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


    const handleDelete = async () => {
        if (!taskToDelete) return;

            try {
                await api.delete(`/task/${taskToDelete}`);
                setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDelete));  
                setShowDeleteModal(false);
                setTaskToDelete(null);
                alert("Tarefa excluída com sucesso!");
              } catch (error) {
                 console.error("Erro ao excluir tarefa:", error) 
                 alert("Erro ao excluir tarefa. Por favor, tente novamente.");
              }
        };

        const confirmDelete = (id: number ) => {
            setTaskToDelete(id);
            setShowDeleteModal(true);
        };

        const cancelDelete = () => {
            setShowDeleteModal(false);
            setTaskToDelete(null);
        };

        return (
            <div className="task-list-container">
                <div className="task-list-header">
                <img src="src/assets/logo-tarefaco.png" alt="logo"/>
                <h1 className="task-list-title"><span>TARE</span>FAÇO</h1>
                </div>
                
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="tasks">
                        {(provided) => (
                             <table 
                             className="task-list-table">
                                 <thead>
                                     <tr>
                                         <th>Nome</th>
                                         <th>Custo</th>
                                         <th>Data Limite</th>
                                         <th>Ações</th>
                                     </tr>
                                 </thead>
                                 <tbody
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}

                                 >
                         {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                 {(provided) => (
                                    <tr
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
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
                            onClick={() => confirmDelete(task.id)}
                            >
                            <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </td>
                        </>
                    )}
                    </tr>
                )}
                </Draggable>
                ))}
                {provided.placeholder}
                </tbody>
                </table>
                )}
                </Droppable>
                </DragDropContext>
                {showDeleteModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Confirmar Exclusão</h2>
                            <p>Tem certeza que deseja excluir esta tarefa?</p>
                            <div className="modal-buttons">
                              <button className="confirm-button" onClick={handleDelete}>
                                Sim
                              </button>
                              <button className="cancel-button" onClick={cancelDelete}>
                                Não
                              </button>
                        </div>
                    </div>
                    </div>
                )}
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
                    <button 
                    className="add-task-button"
                    onClick={handleAddTask}
                    disabled={!newTask.nome || !newTask.custo || !newTask.dataLimite}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
        );
};

export default TaskList;