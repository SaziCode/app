import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import AddGoal from "./pages/AddGoal";
import Dashboard from './pages/Dashboard';
import GoalTasks from './pages/GoalTasks';



const App = () => {
  return (
    <Router>
      <Routes>
        ,
	  <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/addgoal" element={<AddGoal />} />
        <Route path="/goal/:goalId" element={<GoalTasks />} /> {/* Маршрут для завдань */}
      </Routes>
    </Router>
  );
};

export default App;