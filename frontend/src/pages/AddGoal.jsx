import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/AddGoal.css';

const AddGoal = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goalId, setGoalId] = useState(null);

  const generateSubtasks = async () => {
    if (!title || !description || !startDate || !deadline) {
      alert("Будь ласка, заповніть всі поля перед генерацією підзадач!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/api/generate-tasks", {
        title,
        description,
        startDate,
        deadline
      });

      setSubtasks(response.data.tasks);
    } catch (error) {
      console.error("Помилка генерації підзадач:", error);
      alert("Не вдалося згенерувати підзадачі");
    } finally {
      setLoading(false);
    }
  };

  const handleSubtaskChange = (index, newDescription) => {
    const updatedTasks = [...subtasks];
    updatedTasks[index] = newDescription;
    setSubtasks(updatedTasks);
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const saveGoal = async () => {
    if (!title || !description || !startDate || !deadline) {
      alert("Будь ласка, заповніть всі поля!");
      return;
    }

    try {
      const userId = Math.floor(Math.random() * 4) + 1;

      const goalResponse = await axios.post("http://localhost:3000/api/goals", {
        user_id: userId,
        title,
        description,
        progress: 0,
        created_at: new Date().toISOString().split("T")[0],
        start_date: startDate,
        deadline,
        status: "active"
      });

      const goalId = goalResponse.data.goalId;
      setGoalId(goalId);

      if (subtasks.length > 0 && goalId) {
        await axios.post("http://localhost:3000/api/tasks", {
          goalId,
          tasks: subtasks
        });
      }

      alert("Мета успішно збережена!");
      setTitle("");
      setDescription("");
      setStartDate("");
      setDeadline("");
      setSubtasks([]);
    } catch (error) {
      console.error("Помилка збереження:", error);
      alert("Не вдалося зберегти мету");
    }
  };

  const adjustTextareaHeight = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  useEffect(() => {
    document.querySelectorAll('.subtask textarea').forEach(textarea => adjustTextareaHeight(textarea));
  }, [subtasks]);

  return (
    <div className="add-goal-container">
      <h2>Додавання нових цілей</h2>
      
      <input
        type="text"
        placeholder="Назва цілі"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <div className="date-container">
        <div>
          <label>Дата початку:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label>Дедлайн:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      <textarea
        placeholder="Опис цілі"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={generateSubtasks} disabled={loading}>
        {loading ? "Генеруємо..." : "Згенерувати підзадачі"}
      </button>
      <button  onClick={() => navigate("/")}>
        Повернутися до списку цілей
      </button>

      {subtasks.length > 0 && (
        <div className="generated-goal">
          <div className="goal-title-container">
            <h3>Ціль: {title}</h3>
          </div>
          <div className="goal-period-container">
            <p>Обраний період часу: {startDate} - {deadline}</p>
          </div>
          <div className="subtasks-container">
            <h3>Підзадачі:</h3>
            {subtasks.map((task, index) => (
              <div key={index} className="subtask">
                <textarea
                  value={task}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                  rows={1}
                  onInput={(e) => adjustTextareaHeight(e.target)}
                />
                <button className="remove-subtask" onClick={() => removeSubtask(index)}>✖</button>
              </div>
            ))}
          </div>
          <button onClick={saveGoal}>Зберегти</button>
        </div>
      )}

     
    </div>
  );
};

export default AddGoal;
