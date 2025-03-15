const express = require('express');
const app = express();
const port = 5000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Goal Planner API is running');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});