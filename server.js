const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

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

const request = require('request');
const TELEGRAM_BOT_TOKEN = '7416061984:AAF3wMHZ3D01EIDM2WWjUEvjnR5DDrdL90U';
const TELEGRAM_CHAT_ID = '1488037388';

app.post('/saveTask', upload.single('task-image'), (req, res) => {
    const newTask = {
        id: nextTaskId++,
        title: req.body['task-title'],
        description: req.body['task-desc'],
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        urgent: req.body['urgent-task'] === 'on',
        likes: 0,
        dislikes: 0,
        status: 'inactive' 
    };

    const message = `New Task Added:\nID: ${newTask.id}\nTitle: ${newTask.title}\nDescription: ${newTask.description}`;
    sendTelegramMessage(message, req.file)
        .then(() => {
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

                fs.writeFile('data.json', JSON.stringify(currentTasks, null, 2), (writeErr) => {
                    if (writeErr) {
                        console.error(writeErr);
                        res.status(500).send('Error saving data');
                        return;
                    }
                    console.log('Task saved successfully');
                    res.status(200).json(newTask); 
                });
            });
        })
        .catch((error) => {
            console.error('Error sending Telegram message:', error);
            res.status(500).send('Error sending Telegram notification');
        });
});


function sendTelegramMessage(message, file) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

    const formData = {
        chat_id: TELEGRAM_CHAT_ID,
        caption: message,
        photo: {
            value: fs.createReadStream(file.path),
            options: {
                filename: file.originalname,
                contentType: file.mimetype
            }
        },
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Подтвердить', callback_data: 'confirm' }],
                [{ text: 'Отклонить', callback_data: 'reject' }]
            ]
        })
    };

    return new Promise((resolve, reject) => {
        request.post({ url: url, formData: formData }, (err, response, body) => {
            if (err) {
                console.error('Error sending photo to Telegram:', err);
                reject(err);
            } else if (response.statusCode !== 200) {
                console.error('Telegram API error:', body);
                reject(new Error(`Telegram API error: ${body.description}`));
            } else {
                console.log('Photo sent to Telegram successfully');
                resolve();
            }
        });
    });
}

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
                res.status(200).json(task); 
            });
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

app.get('/access', (req, res) => {
    fs.readFile(path.join(__dirname, 'settings.json'), (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading settings file');
            return;
        }
        try {
            const settings = JSON.parse(data);
            if (settings[0].access === "True") {
                res.send('True');
            } else {
                res.send('Access denied');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error parsing settings file');
        }
    });
});

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
                res.status(200).json(task); 
            });
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

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
    const taskId = parseInt(req.query.id); 

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
                res.status(200).json(tasks[taskIndex]);
            });
        } catch (parseError) {
            console.error('Error parsing data.json:', parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
