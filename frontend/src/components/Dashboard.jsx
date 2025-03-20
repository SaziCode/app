import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Імпортуємо CSS-файл

const Dashboard = () => {
    const [activityData, setActivityData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [goal, setGoal] = useState({});
    const [lastUpdate, setLastUpdate] = useState('тиждень тому');
	const [totalTime, setTotalTime] = useState(0); // Початковий стан для збереження загального часу
	useEffect(() => {



		if (goal.id) {
			// Отримання останньої дати оновлення
			axios.get('http://localhost:3000/api/goals/last-update', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				params: { goalId: goal.id }, // Передаємо ID активної цілі
			})
			.then((response) => {
				const lastUpdateDate = new Date(response.data.last_update);
				setLastUpdate(lastUpdateDate.toLocaleDateString()); // Форматуємо дату
			})
			.catch((error) => {
				console.error('Помилка при отриманні останньої дати оновлення:', error);
			});
		}
		// Отримання даних активності

		// Отримання загального часу для мети
		
		if (goal.id) {
			axios.get(`http://localhost:3000/api/goals/${goal.id}/total-time`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})
			.then((response) => {
				setTotalTime(Number(response.data.total_hours)); // Встановлюємо загальну суму
			})
			.catch((error) => {
				console.error('Помилка при отриманні загального часу для мети:', error);
			});


		if (goal.id) {
			// Отримання даних активності для нової активної цілі
			axios.get('http://localhost:3000/api/activity-data', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				params: { goalId: goal.id }, // Передаємо ID активної цілі
			})
			.then((response) => {
				const formattedData = response.data.map((data, index, array) => {
					if (index === 0) {
						return { ...data, progress_difference: data.total_progress }; // Перший місяць: використовуємо total_progress
					} else {
						const previous = array[index - 1];
						return {
							...data,
							progress_difference: data.total_progress - previous.total_progress,
						};
					}
				});
				setActivityData(formattedData); // Оновлюємо графік
			})
			.catch((error) => {
				console.error('Помилка при отриманні даних активності:', error);
			});
		}
		// Отримання даних цілі
		axios.get('http://localhost:3000/api/goals', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		})
		.then((response) => {
			if (Array.isArray(response.data) && response.data.length > 0) {
				setGoal(response.data[0]); // Вибираємо першу ціль з масиву
			} else {
				console.error('Цілі не знайдено');
			}
		})
		.catch((error) => {
			console.error('Помилка при отриманні даних цілі:', error);
		});
	
			const handleSwitchGoal = () => {
		axios.post('http://localhost:3000/api/goals/switch', 
			{ currentGoalId: goal.id }, 
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			}
		)
		.then((response) => {
			console.log('Ціль оновлено:', response.data);
	
			// Оновлюємо поточну ціль
			axios.get('http://localhost:3000/api/goals', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})
			.then((response) => {
				if (Array.isArray(response.data) && response.data.length > 0) {
					const activeGoal = response.data.find((g) => g.status === 'active');
					setGoal(activeGoal || {}); // Встановлюємо нову активну ціль
	
					// Оновлюємо дані активності для нової цілі
					axios.get('http://localhost:3000/api/activity-data', {
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					})
					.then((response) => {
						const formattedData = response.data.map((data, index, array) => {
							if (index === 0) {
								return { ...data, progress_difference: null }; // Перший місяць без різниці
							} else {
								const previous = array[index - 1];
								return {
									...data,
									progress_difference: data.total_progress - previous.total_progress,
								};
							}
						});
						setActivityData(formattedData); // Оновлюємо графік
					})
					.catch((error) => {
						console.error('Помилка при отриманні даних активності:', error);
					});
				} else {
					console.error('Цілі не знайдено');
				}
			})
			.catch((error) => {
				console.error('Помилка при отриманні даних цілі:', error);
			});
		})
		.catch((error) => {
			console.error('Помилка при перемиканні цілі:', error);
		});
	};
	

    const handleMonthClick = (month) => {
        const currentMonthData = activityData.find((data) => data.month === month);
        const previousMonthData = activityData.find((data) => data.month === month - 1);

        if (currentMonthData && previousMonthData) {
            setComparisonData({
                current: currentMonthData,
                previous: previousMonthData,
                difference: currentMonthData.total_progress - previousMonthData.total_progress,
            });
        } else {
            setComparisonData(null);
        }
        setSelectedMonth(month);
    };
	
		}
	}, [goal.id]); // Виконуємо запит, коли змінюється `goal.id`


	const handleSwitchGoal = () => {
		axios.post('http://localhost:3000/api/goals/switch', 
			{ currentGoalId: goal.id }, 
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			}
		)
		.then((response) => {
			console.log('Ціль оновлено:', response.data);
	
			// Оновлюємо поточну ціль
			axios.get('http://localhost:3000/api/goals', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})
			.then((response) => {
				if (Array.isArray(response.data) && response.data.length > 0) {
					const activeGoal = response.data.find((g) => g.status === 'active');
					setGoal(activeGoal || {}); // Встановлюємо нову активну ціль
	
					// Оновлюємо дані активності для нової цілі
					axios.get('http://localhost:3000/api/activity-data', {
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
						params: { goalId: activeGoal.id }, // Передаємо ID нової активної цілі
					})
					.then((response) => {
						const formattedData = response.data.map((data, index, array) => {
							if (index === 0) {
								return { ...data, progress_difference: null }; // Перший місяць без різниці
							} else {
								const previous = array[index - 1];
								return {
									...data,
									progress_difference: data.total_progress - previous.total_progress,
								};
							}
						});
						setActivityData(formattedData); // Оновлюємо графік
					})
					.catch((error) => {
						console.error('Помилка при отриманні даних активності:', error);
					});
				} else {
					console.error('Цілі не знайдено');
				}
			})
			.catch((error) => {
				console.error('Помилка при отриманні даних цілі:', error);
			});
		})
		.catch((error) => {
			console.error('Помилка при перемиканні цілі:', error);
		});
	};
	

    const handleMonthClick = (month) => {
        const currentMonthData = activityData.find((data) => data.month === month);
        const previousMonthData = activityData.find((data) => data.month === month - 1);

        if (currentMonthData && previousMonthData) {
            setComparisonData({
                current: currentMonthData,
                previous: previousMonthData,
                difference: currentMonthData.total_progress - previousMonthData.total_progress,
            });
        } else {
            setComparisonData(null);
        }
        setSelectedMonth(month);
    };
	
	
	

    return (
        <div className="container">
			
			<p className="date">Сьогодні: {new Date().toLocaleDateString()}</p>
			
            
            <div className="goal-container">
                <div className="goal-details">
                    <div className="goal-card">
                        <div className="goal-icon">📖</div>
                        <div>
                            <p className="goal-text">Ціль: {goal.title}</p>
                            <p className="goal-tags">Теги: {goal.tags}</p>
                        </div>
                    </div>
                    <div className="progress-container">
                        <div className="goal-card">
                            <span className="progress-label">Прогрес</span>
                            <div className="progress-bar">
                                <div className="progress-bar-fill"style={{ width: `${goal.progress || 0}%` }}></div>
                            </div>
                        </div>
                        <div className="progress-details">
                            <span className="goal-card">⏳ Витрачено часу: {totalTime.toLocaleString()}ч</span>
                            <span className="goal-card">📅 Активний місяць: {new Date().toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <button className="button" onClick={handleSwitchGoal}>
    						Перейти до наступної цілі
						</button>
                    </div>
                </div>
            </div>

            <div className="chart-container">
    			<h3 className="sub-header">Активність за 8 місяців</h3>
   				 <div className="chart">
       				 {activityData.map((data) => (
          				  <div key={data.month} className="bar-wrapper">
              				  <div
                  				className="bar"
                  				onClick={() => handleMonthClick(data.month)}
                  				style={{
                  					height: `${Math.min(data.progress_difference || data.total_progress, 100) * 3}px`, // Ліміт 100
                  	 		 	}}
         			       >
                 			   {selectedMonth === data.month && (
                    		   		<span className="bar-label">  {data.progress_difference !== null ? `${data.progress_difference}%` : '0%'}</span>
                    			)}
               				 </div>
              				  {/* Відображення місяця під стовпчиком */}
               				 <span className="month-label">
                  				  {new Date(data.year, data.month - 1).toLocaleString('default', { month: 'short' })}
               				 </span>
          				  </div>
       					 ))}
    				</div>
			</div>

<div className="goal-card">
<div className="update-reminder" >
                <p>Не забудьте оновити дані своїх цілей!</p>
                <p className="last-update">Останнє оновлення: {lastUpdate}</p>
            </div>
</div>
            

            <div className="footer">
                <button className="footer-button">⚙</button>
                <button className="footer-add-button">➕</button>
                <button className="footer-button">💡</button>
            </div>
        </div>
    );
};

export default Dashboard;