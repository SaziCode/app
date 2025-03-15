// components/GoalCard.jsx

import React from "react";

const GoalCard = ({ goal }) => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold">{goal.name}</h3>
            <p>{goal.description}</p>
        </div>
    );
};

export default GoalCard;
