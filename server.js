const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Парсим данные POST запросов
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Разрешает доступ всем доменам
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// POST запрос на сохранение данных
app.post('/saveTask', (req, res) => {
    const newTask = req.body.task;

    // Set initial likes and dislikes to 0
    newTask.likes = 0;
    newTask.dislikes = 0;

    // Read current tasks from data.json
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') { // Handle errors other than file not found
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

        // Write updated tasks to data.json
        fs.writeFile('data.json', JSON.stringify(currentTasks, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                res.status(500).send('Error saving data');
                return;
            }
            console.log('Task saved successfully');
            res.status(200).send('Task added successfully');
        });
    });
});

app.post('/likeTask', (req, res) => {
    const taskId = req.body.taskId; // Assuming taskId is sent from client-side

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
    const taskId = req.body.taskId; // Assuming taskId is sent from client-side

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

// GET запрос для получения всего JSON из файла data.json
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

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
