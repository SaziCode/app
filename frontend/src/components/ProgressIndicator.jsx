import React from 'react';

const ProgressIndicator = ({ progress }) => {
    return (
        <div>
            <h3>Ваш прогрес</h3>
            <progress value={progress} max="100">{progress}%</progress>
            <p>{progress}%</p>
        </div>
    );
};

export default ProgressIndicator;
