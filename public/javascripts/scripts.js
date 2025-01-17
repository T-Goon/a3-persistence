console.log(document.cookie)


// Update the tasks table data
let updateTasks = (tasks) => {

    // sort based on priority
    tasks.sort((elem1, elem2) => {
        if (elem1.priority > elem2.priority) {
            return -1;
        } else if (elem1.priority === elem2.priority) {
            return 0;
        } else {
            return 1;
        }
    });

    const holder = document.querySelector('#task-holder');
    holder.innerHTML = '';

    tasks.forEach((element, index) => {

        // Create table row
        const row = document.createElement('tr');

        // Task title
        const titleData = document.createElement('td');
        const titleLabel = document.createElement('label');
        const titleInput = document.createElement('input');
        titleLabel.htmlFor = `title-${index}`;
        titleLabel.ariaLabel = "Task Title Input";
        titleLabel.className = 'd-inline';
        titleInput.className = 'form-control';
        titleData.appendChild(titleLabel);
        titleData.appendChild(titleInput);
        titleInput.value = element.title;
        titleInput.id = `title-${index}`;

        // Task description
        const descriptionData = document.createElement('td');
        const descriptionLabel = document.createElement('label');
        const descriptionInput = document.createElement('input');
        descriptionLabel.htmlFor = `description-${index}`;
        descriptionLabel.ariaLabel = "Task Description Input";
        descriptionLabel.className = 'd-inline';
        descriptionInput.className = 'form-control';
        descriptionData.appendChild(descriptionLabel);
        descriptionData.appendChild(descriptionInput);
        descriptionInput.value = element.description;
        descriptionInput.id = `description-${index}`;

        // Task priority
        const priorityData = document.createElement('td');
        const priorityLabel = document.createElement('label');
        const priorityInput = document.createElement('input');
        priorityLabel.htmlFor = `priority-${index}`;
        priorityLabel.ariaLabel = "Task Priority Input";
        priorityLabel.className = 'd-inline';
        priorityInput.className = 'form-control';
        priorityInput.type = 'number';
        priorityInput.min = 0;
        priorityInput.max = 10;
        priorityData.appendChild(priorityLabel);
        priorityData.appendChild(priorityInput);
        priorityInput.value = element.priority;
        priorityInput.id = `priority-${index}`;

        // Task creation date
        const dateCreatedData = document.createElement('td');
        const dateCreatedLabel = document.createElement('label');
        const dateCreatedInput = document.createElement('input');
        dateCreatedLabel.htmlFor = `dateCreated-${index}`;
        dateCreatedLabel.ariaLabel = "Task Date Created";
        dateCreatedLabel.className = 'd-inline';
        dateCreatedInput.id = `dateCreated-${index}`;
        dateCreatedInput.className = 'form-control';
        dateCreatedInput.readOnly = true;
        dateCreatedData.appendChild(dateCreatedLabel);
        dateCreatedData.appendChild(dateCreatedInput);
        dateCreatedInput.value = element.dateCreated;

        // Task deadline
        const deadlineData = document.createElement('td');
        const deadlineLabel = document.createElement('label');
        const deadlineInput = document.createElement('input');
        deadlineLabel.htmlFor = `deadline-${index}`;
        deadlineLabel.ariaLabel = "Task Deadline";
        deadlineLabel.className = 'd-inline';
        deadlineInput.id = `deadline-${index}`;
        deadlineInput.className = 'form-control';
        deadlineInput.readOnly = true;
        deadlineData.appendChild(deadlineInput);
        deadlineInput.value = element.deadline;

        // Task delete button
        const buttonData = document.createElement('td');

        const delBtn = document.createElement('button');
        delBtn.className = "btn btn-danger";
        delBtn.appendChild(document.createTextNode('Delete'));
        delBtn.onclick = (e) => {
            delTask(element.title);
        };

        // Task edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-warning';
        editBtn.appendChild(document.createTextNode('Save Edits'));
        editBtn.onclick = (e) => {
            editTask(index, element.title);
        };

        buttonData.appendChild(editBtn);
        buttonData.appendChild(delBtn);

        // Append everything together
        row.appendChild(titleData);
        row.appendChild(descriptionData);
        row.appendChild(priorityData);
        row.appendChild(dateCreatedData);
        row.appendChild(deadlineData);

        row.appendChild(buttonData);

        holder.appendChild(row);
    });
}

// Add task submit callback
const submit = async function (e) {
    // prevent default form action from being carried out
    e.preventDefault();

    // Get and format today's date
    var today = new Date();
    const dateString = `${String(today.getMonth() + 1).padStart(2, '0')}/` +
        `${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    const title = document.querySelector('#title');
    const description = document.querySelector('#description');

    const priority = document.querySelector('#priority-range');
    if ((!priority.valueAsNumber && priority.valueAsNumber !== 0) || priority.valueAsNumber < 0 || priority.valueAsNumber > 10) {
        alert('Priority must be 0 - 10');
        return;
    }

    // Compile Data
    const json = {
        title: title.value,
        description: description.value,
        dateCreated: dateString,
        priority: priority.valueAsNumber
    };
    const body = JSON.stringify(json);

    // Send data
    const userId = await getUserId();
    fetch(`/user/${userId}/submit`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body
    })
        .then(async function (response) {
            const tasks = await response.json();

            if (tasks.error) {
                alert(tasks.error);
                return;
            }

            updateTasks(tasks);
        });

    return false;
}

const editTask = async (i, title) => {

    const index = parseInt(i);
    const priority = document.querySelector(`#priority-${index}`);

    if ((!priority.valueAsNumber && priority.valueAsNumber !== 0) || priority.valueAsNumber < 0 || priority.valueAsNumber > 10) {
        alert('Priority must be 0 - 10');
        return;
    }

    const userId = await getUserId();
    fetch(`/user/${userId}/edit`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
            oldTitle: title,
            newTitle: document.querySelector(`#title-${index}`).value,
            description: document.querySelector(`#description-${index}`).value,
            priority: priority.valueAsNumber
        })
    }).then(async (data) => {
        const tasks = await data.json();

        if (tasks.error) {
            alert(tasks.error);
            return;
        }

        updateTasks(tasks);
    }).catch((err) => {
        console.log(err);
    });
};

const delTask = async (title) => {

    const userId = await getUserId();
    fetch(`/user/${userId}/delete`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ title })
    }).then(async (data) => {
        const tasks = await data.json();

        updateTasks(tasks);
    }).catch((err) => {
        console.log(err);
    });
};

const getUserId = async () => {
    const data = await fetch(`/user/get-login-cookie`, {
        method: 'GET'
    });
    return (await data.json()).userId;
}

window.onload = function () {
    const button = document.querySelector('#addTask-btn');
    button.onclick = submit;
}