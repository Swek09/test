document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(taskForm);
        const taskData = {
            title: formData.get('task-title'),
            description: formData.get('task-desc'),
            imageUrl: formData.get('task-image'),
            urgent: formData.get('urgent-task') === 'on', // Checkbox value handling
            likes: 0, // Initialize likes to 0
            dislikes: 0, // Initialize dislikes to 0
        };

        // Send taskData to server via POST request
        fetch('https://test.api.yadro.space/saveTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task: taskData }),
        })
        .then(response => {
            if (response.ok) {
                console.log('Task added successfully');
                window.location.href = './index.html'; // Redirect to tasks list page
            } else {
                console.error('Failed to add task');
            }
        })
        .catch(error => {
            console.error('Error adding task:', error);
        });
    });
});
