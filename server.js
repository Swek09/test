const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

let nextTaskId = 1; // Initialize the next task ID

// Middleware to parse JSON and handle CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// POST request to save a new task
app.post('/saveTask', (req, res) => {
    const newTask = req.body.task;

    // Assign a unique ID to the new task
    newTask.id = nextTaskId++;
    newTask.likes = 0; // Initialize likes
    newTask.dislikes = 0; // Initialize dislikes

    // Read existing tasks from data.json
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            res.status(500).send('Error reading data');
            return;
        }

        let currentTasks = [];
        if (!err) {
            try {
                currentTasks = JSON.parse(data);
            } catch (parseError) {
                console.error(parseError);
                res.status(500).send('Error parsing data');
                return;
            }
        }

        // Add new task to current tasks array
        currentTasks.push(newTask);

        // Write updated tasks back to data.json
        fs.writeFile('data.json', JSON.stringify(currentTasks, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                res.status(500).send('Error saving data');
                return;
            }
            console.log('Task saved successfully');
            res.status(200).json(newTask); // Return newly added task object with ID
        });
    });
});

// Increment likes for a specific task
app.post('/likeTask', (req, res) => {
    const taskId = req.body.taskId;

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка чтения данных');
            return;
        }
        try {
            const tasks = JSON.parse(data);
            const task = tasks.find(t => t.id === taskId);

            if (!task) {
                res.status(404).send('Задача не найдена');
                return;
            }

            task.likes += 1;

            fs.writeFile('data.json', JSON.stringify(tasks, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    res.status(500).send('Ошибка сохранения данных');
                    return;
                }
                console.log(`Увеличено число лайков для задачи с ID ${taskId}`);
                res.status(200).json(task); // Return updated task object
            });
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Ошибка парсинга данных');
        }
    });
});

// Increment dislikes for a specific task
app.post('/dislikeTask', (req, res) => {
    const taskId = req.body.taskId;

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка чтения данных');
            return;
        }
        try {
            const tasks = JSON.parse(data);
            const task = tasks.find(t => t.id === taskId);

            if (!task) {
                res.status(404).send('Задача не найдена');
                return;
            }

            task.dislikes += 1;

            fs.writeFile('data.json', JSON.stringify(tasks, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    res.status(500).send('Ошибка сохранения данных');
                    return;
                }
                console.log(`Увеличено число дизлайков для задачи с ID ${taskId}`);
                res.status(200).json(task); // Return updated task object
            });
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Ошибка парсинга данных');
        }
    });
});

// GET request to fetch all tasks
app.get('/getTasks', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка чтения данных');
            return;
        }
        try {
            const tasks = JSON.parse(data);
            res.status(200).json(tasks);
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Ошибка парсинга данных');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

