import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskList from "./components/TaskList";
import "./styles/TaskList.css"
  
  const App: React.FC = () => {
    return (
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<TaskList />} />
          </Routes>
        </div>
      </Router>
    );
  };


export default App
