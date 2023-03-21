const taskContainers = document.querySelectorAll('.task-container');
let btns = document.querySelectorAll('.btn-add');
let deleteBtns = Array.from(document.querySelectorAll('.fa-trash'));
let editBtns = Array.from(document.querySelectorAll('.fa-pen-to-square'));

// let tasks = Array.from(document.querySelectorAll('.task'));
// let count = 0;
const taskName = ["'To do Task'", '"In Progress Task"', '"Testing Task"', '"Done Task"'];

for (let i = 0; i < 4; ++i) {
  btns[i].addEventListener('click', function () {
    // container element
    taskContainers[i].insertAdjacentHTML(
      'beforeend',
      `<div class="task" draggable="true">
          <textarea readonly placeholder=${taskName[i]} ></textarea>
          <span>
              <i class="fa-solid fa-pen-to-square"></i>
              <i class="fa-solid fa-trash"></i>
              <i class="fa-solid fa-microphone"></i>
          </span>
        </div>`
    );
    ////  VARIABLES  ////
    const lastTask = btns[i].previousElementSibling.lastElementChild; //the created task
    const micBtn = lastTask.querySelector('.fa-microphone');
    const deleteBtn = lastTask.querySelector('.fa-trash');
    const editBtn = lastTask.querySelector('.fa-pen-to-square');
    const textarea = lastTask.querySelector('textarea');
    // micBtn = btns[i].previousElementSibling.lastElementChild.querySelector(".fa-microphone");
    // const deletebtn = micBtn.previousElementSibling;
    // const editBtn = deleteBtn.previousElementSibling;

    storeTasks();
    // btns[i].previousElementSibling.lastChild.firstElementChild.focus();
    enableTaskEditing(textarea); //this function instead of previous line to focus the text area
    dragAndDrop(lastTask);
    speechReco(micBtn);

    listenFocusOut(textarea);
    listenEditClick(editBtn);
    listenDeleteClick(deleteBtn);

    touchDragDrop(lastTask);
  });
}

dragging();

//store data in localstorage
const storeTasks = () => {
  const allTasks = ['todoTasks', 'InProgressTasks', 'TestingTasks', 'DoneTasks'];
  for (let i = 0; i < 4; ++i) {
    localStorage.setItem(
      allTasks[i],
      JSON.stringify(
        [...taskContainers[i].querySelectorAll('.task')].map((t) => {
          return t.firstElementChild.value;
        })
      )
    );
  }
};

function enableTaskEditing(textarea) {
  textarea.focus();
  textarea.removeAttribute('readonly');
}

function listenEditClick(editBtn) {
  editBtn.addEventListener('click', () => {
    const textarea = editBtn.parentElement.previousElementSibling;
    enableTaskEditing(textarea);
  });
}

function listenFocusOut(textarea) {
  textarea.addEventListener('focusout', () => {
    textarea.setAttribute('readonly', true);
    storeTasks();
  });
}

// Add all new delete icons to the array
function listenDeleteClick(deleteBtn) {
  deleteBtn.addEventListener('click', function () {
    deleteBtn.parentElement.parentElement.remove();
    storeTasks();
  });
}

function dragAndDrop(task) {
  task.addEventListener('dragstart', () => {
    task.classList.add('dragging');
  });

  task.addEventListener('dragend', () => {
    task.classList.remove('dragging');
    storeTasks();
  });
}

function dragging() {
  taskContainers.forEach((container) => {
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getAfterElement(container, e.clientY);
      const theDraggableTask = document.querySelector('.dragging');
      if (afterElement == null) {
        container.appendChild(theDraggableTask);
      } else {
        container.insertBefore(theDraggableTask, afterElement);
      }
    });
  });
}

function getAfterElement(container, y) {
  const draggableTasks = [...container.querySelectorAll('.task:not(.dragging)')];
  return draggableTasks.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      // console.log(box)
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

const getData = () => {
  const todoTasks = JSON.parse(localStorage.getItem('todoTasks'));
  const InProgressTasks = JSON.parse(localStorage.getItem('InProgressTasks'));
  const TestingTasks = JSON.parse(localStorage.getItem('TestingTasks'));
  const DoneTasks = JSON.parse(localStorage.getItem('DoneTasks'));
  const allTasks = [todoTasks, InProgressTasks, TestingTasks, DoneTasks];

  for (let i = 0; i < allTasks.length; ++i) {
    allTasks[i].forEach((task) => {
      taskContainers[i].insertAdjacentHTML(
        'beforeend',
        `<div class="task" draggable="true">
                  <textarea readonly placeholder=${taskName[i]} >${task}</textarea>
                    <span>
                      <i class="fa-solid fa-pen-to-square"></i>
                      <i class="fa-solid fa-trash"></i>
                      <i class="fa-solid fa-microphone"></i>
                    </span>
              </div>`
      );
      const lastTask = taskContainers[i].lastElementChild; // last created task
      const micBtn = lastTask.querySelector('.fa-microphone');
      const deleteBtn = lastTask.querySelector('.fa-trash');
      const editBtn = lastTask.querySelector('.fa-pen-to-square');
      const textarea = lastTask.querySelector('textarea');
      
      speechReco(micBtn); // we pass only the last created mic to speachRecog
      touchDragDrop(lastTask);
      dragAndDrop(lastTask);

      listenFocusOut(textarea);
      listenEditClick(editBtn);
      listenDeleteClick(deleteBtn);
    });
  }
};
getData();

function touchDragDrop(task) {
  task.addEventListener('touchstart', (e) => {
    timer = setTimeout(() => {
      task.classList.add('dragging');
      task.style.position = 'absolute';
    }, 300);
  });

  task.addEventListener('touchend', (e) => {
    if (timer) {
      clearTimeout(timer);
    }
    task.classList.remove('dragging');
    task.style.position = 'relative';
    task.style.top = 'auto';
    task.style.left = 'auto';
    storeTasks();
  });

  task.addEventListener('touchmove', (e) => {
    if (task.classList.contains('dragging')) {
      task.style.top = `${e.touches[0].clientY - task.offsetHeight / 2}px`;
      task.style.left = `${e.touches[0].clientX - task.offsetWidth / 2}px`;

      const ourElems = document.elementsFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      ourElems.forEach((element) => {
        if (element.classList.contains('task-container')) {
          const bottomTask = getAfterElement(element, e.touches[0].clientY);
          if (!bottomTask) {
            element.appendChild(task);
          } else {
            element.insertBefore(task, bottomTask);
          }
        }
      });
    }
  });
}
function speechReco(mic) {
  mic.addEventListener('click', () => {
    let speech = true;
    window.SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;

    recognition.addEventListener('result', (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript);
      mic.parentElement.previousElementSibling.innerHTML = transcript;
      storeTasks();
    });

    if (speech == true) {
      recognition.start();
    }
  });
}
