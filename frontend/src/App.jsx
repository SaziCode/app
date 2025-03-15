import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"; // Перевірте, чи правильно цей компонент імпортується

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Перевірте правильність передачі Home компонента */}
      </Routes>
    </Router>
  );
};

export default App;
