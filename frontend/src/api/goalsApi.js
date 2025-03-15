// api/goalsApi.js

export const fetchGoals = async () => {
    const response = await fetch('/api/goals');
    if (!response.ok) {
        throw new Error('Не вдалося завантажити цілі');
    }
    return await response.json();
};

export const fetchReminders = async () => {
    const response = await fetch('/api/reminders');
    if (!response.ok) {
        throw new Error('Не вдалося завантажити нагадування');
    }
    return await response.json();
};

export const fetchActivityGraph = async () => {
    const response = await fetch('/api/activity');  // Замість /api/activity потрібно використовувати правильний шлях
    if (!response.ok) {
        throw new Error('Не вдалося завантажити графік активності');
    }
    return await response.json();
};
