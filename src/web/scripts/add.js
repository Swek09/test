const serverUrl = 'https://test.api.yardo.space';

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(taskForm);

        fetch(`${serverUrl}/saveTask`, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                console.log('Task added successfully');
                window.location.href = '../index.html';
            } else {
                console.error('Failed to add task');
            }
        })
        .catch(error => {
            console.error('Error adding task:', error);
        });
    });
});
