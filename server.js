const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON and handle CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Initialize nextTaskId from data.json if it exists
let nextTaskId = 1;
fs.readFile('data.json', 'utf8', (err, data) => {
    if (!err) {
        try {
            const tasks = JSON.parse(data);
            nextTaskId = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
        } catch (parseError) {
            console.error('Error parsing data for task ID initialization:', parseError);
        }
    }
});

// POST request to save a new task
app.post('/saveTask', upload.single('task-image'), (req, res) => {
    const newTask = {
        id: nextTaskId++,
        title: req.body['task-title'],
        description: req.body['task-desc'],
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        urgent: req.body['urgent-task'] === 'on',
        likes: 0,
        dislikes: 0
    };

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
            res.status(500).send('Error reading data');
            return;
        }
        try {
            const tasks = JSON.parse(data);
            const task = tasks.find(t => t.id === taskId);

            if (!task) {
                res.status(404).send('Task not found');
                return;
            }

            task.likes += 1;

            fs.writeFile('data.json', JSON.stringify(tasks, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    res.status(500).send('Error saving data');
                    return;
                }
                console.log(`Likes incremented for task with ID ${taskId}`);
                res.status(200).json(task); // Return updated task object
            });
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

// Increment dislikes for a specific task
app.post('/dislikeTask', (req, res) => {
    const taskId = req.body.taskId;

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading data');
            return;
        }
        try {
            const tasks = JSON.parse(data);
            const task = tasks.find(t => t.id === taskId);

            if (!task) {
                res.status(404).send('Task not found');
                return;
            }

            task.dislikes += 1;

            fs.writeFile('data.json', JSON.stringify(tasks, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    res.status(500).send('Error saving data');
                    return;
                }
                console.log(`Dislikes incremented for task with ID ${taskId}`);
                res.status(200).json(task); // Return updated task object
            });
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

// GET request to fetch all tasks
app.get('/getTasks', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading data');
            return;
        }
        try {
            const tasks = JSON.parse(data);
            res.status(200).json(tasks);
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

app.get('/getTaskById', (req, res) => {
    const taskId = parseInt(req.query.id); // Assuming id is passed as query parameter

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading data');
            return;
        }
        try {
            const tasks = JSON.parse(data);
            const task = tasks.find(t => t.id === taskId);

            if (!task) {
                res.status(404).send('Task not found');
                return;
            }

            res.status(200).json(task);
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

// POST request to add an answer to a task
app.post('/addAnswer', (req, res) => {
    const { taskId, name, answer } = req.body;

    if (!taskId || !name || !answer) {
        return res.status(400).send('Invalid request parameters.');
    }

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            return res.status(500).send('Error reading data');
        }

        try {
            const tasks = JSON.parse(data);
            const taskIndex = tasks.findIndex(t => t.id === parseInt(taskId));

            if (taskIndex === -1) {
                return res.status(404).send('Task not found');
            }

            if (!tasks[taskIndex].answers) {
                tasks[taskIndex].answers = [];
            }

            tasks[taskIndex].answers.push({
                name: name,
                answer: answer,
                timestamp: new Date().toISOString()
            });

            fs.writeFile('data.json', JSON.stringify(tasks, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing data.json:', writeErr);
                    return res.status(500).send('Error saving data');
                }
                console.log('Answer added successfully');
                res.status(200).json(tasks[taskIndex]); // Return updated task object
            });
        } catch (parseError) {
            console.error('Error parsing data.json:', parseError);
            res.status(500).send('Error parsing data');
        }
    });
});



// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
