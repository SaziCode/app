import React, { useState } from 'react';
import axios from 'axios';

const AddGoal = () => {
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
      const userId = Math.floor(Math.random() * 4) + 1; // Рандомне id користувача

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

      if (subtasks.length > 0) {
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

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Додати нову ціль</h2>
      
      <input
        type="text"
        placeholder="Назва цілі"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      
      <textarea
        placeholder="Опис цілі"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <label className="block font-medium">Дата початку:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <label className="block font-medium">Дедлайн:</label>
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={generateSubtasks}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Генеруємо..." : "Згенерувати підзадачі"}
      </button>

      {subtasks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Підзадачі:</h3>
          {subtasks.map((task, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={task}
                onChange={(e) => handleSubtaskChange(index, e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button onClick={() => removeSubtask(index)} className="ml-2 text-red-500">✖</button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={saveGoal}
        className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Зберегти
      </button>
    </div>
  );
};

export default AddGoal;