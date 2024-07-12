fetch('https://test.api.yadro.space/getTasks')
    .then(response => response.json())
    .then(tasks => {
        const tasksContainer = document.querySelector('.tasks-container');

        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            taskDiv.setAttribute('id', `task-${task.id}`); // Assuming each task has an ID

            const taskImage = document.createElement('img');
            taskImage.src = task.imageUrl;
            taskImage.alt = 'фото задачи';
            taskImage.classList.add('task-image');

            const taskDetailsDiv = document.createElement('div');
            taskDetailsDiv.classList.add('task-details');

            const taskTitle = document.createElement('p');
            taskTitle.classList.add('task-title');
            taskTitle.textContent = task.title;

            const likeDislikeContainer = document.createElement('div');
            likeDislikeContainer.classList.add('like-dislike-container');

            const likeButton = document.createElement('button');
            likeButton.classList.add('like-button');
            likeButton.innerHTML = `
                <img src="./img/thumb-up.png" alt="Лайк">
                <span class="like-count">${task.likes}</span>
            `;

            likeButton.addEventListener('click', () => {
                incrementLike(task.id); // Function to increment likes (defined below)
            });

            const dislikeButton = document.createElement('button');
            dislikeButton.classList.add('dislike-button');
            dislikeButton.innerHTML = `
                <img src="./img/thumb-down.png" alt="Дизлайк">
                <span class="dislike-count">${task.dislikes}</span>
            `;

            dislikeButton.addEventListener('click', () => {
                incrementDislike(task.id); // Function to increment dislikes (defined below)
            });

            likeDislikeContainer.appendChild(likeButton);
            likeDislikeContainer.appendChild(dislikeButton);

            taskDetailsDiv.appendChild(taskTitle);
            taskDetailsDiv.appendChild(likeDislikeContainer);

            taskDiv.appendChild(taskImage);
            taskDiv.appendChild(taskDetailsDiv);

            tasksContainer.appendChild(taskDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching tasks:', error);
    });

function incrementLike(taskId) {
    fetch('https://test.api.yadro.space/likeTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
    })
    .then(response => response.json())
    .then(updatedTask => {
        const likeCountSpan = document.querySelector(`#task-${updatedTask.id} .like-count`);
        likeCountSpan.textContent = updatedTask.likes;
    })
    .catch(error => {
        console.error('Error incrementing like:', error);
    });
}

function incrementDislike(taskId) {
    fetch('https://test.api.yadro.space/dislikeTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
    })
    .then(response => response.json())
    .then(updatedTask => {
        const dislikeCountSpan = document.querySelector(`#task-${updatedTask.id} .dislike-count`);
        dislikeCountSpan.textContent = updatedTask.dislikes;
    })
    .catch(error => {
        console.error('Error incrementing dislike:', error);
    });
}
