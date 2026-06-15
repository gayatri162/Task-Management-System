let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentUser = "";

window.addEventListener("DOMContentLoaded", () => {
 const addBtn = document.querySelector(".add-btn");
 if (addBtn) addBtn.addEventListener("click", addTask);

 const clearBtn = document.getElementById("clearAllBtn");
 if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      tasks = [];
      saveTasks();
    });
 }

 const taskInput = document.getElementById("taskInput");
  if (taskInput) {
    taskInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") addTask();
    });
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "true") {
    document.body.classList.add("dark");
    themeToggle.innerText = "☀️";
  } else {
    themeToggle.innerText = "🌙";
  }

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);

  themeToggle.innerText = isDark ? "☀️" : "🌙";
 });
});

function signup(){
const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

localStorage.setItem("username",username);
localStorage.setItem("password",password);
localStorage.setItem("lastUser", username);

alert("Signup Successful");
}

function login(){

const username =
document.getElementById("username").value;

const password =
document.getElementById("password").value;

if(
username === localStorage.getItem("username")
&&
password === localStorage.getItem("password")
){

localStorage.setItem("isLoggedIn","true");
localStorage.setItem("lastUser", username);

currentUser = username;

tasks =
JSON.parse(
localStorage.getItem("tasks_"+username)
) || [];    

document.getElementById("auth-section").style.display="none";

document.getElementById("app-section").style.display="block";

renderTasks();
}
else{

alert("Invalid Credentials");
}
}

function logout(){

localStorage.removeItem("isLoggedIn");
location.reload();
}

function addTask(){

const taskText =
document.getElementById("taskInput").value;

const priority = 
document.getElementById("prioritySelect").value;

const dueDate =
document.getElementById("dueDate").value;

if(taskText.trim() === ""){
alert("Enter Task");
return;
}

tasks.push({
 text: taskText,
 date: dueDate,
 completed: false,
 priority: priority
});

saveTasks();

document.getElementById("taskInput").value="";
document.getElementById("dueDate").value="";
}

function saveTasks(){
 if (!currentUser) return;

    localStorage.setItem(
    "tasks_"+currentUser,
    JSON.stringify(tasks)
);

renderTasks();
}

function checkEmpty() {
  const emptyMsg = document.getElementById("emptyMsg");

  if (!emptyMsg) return;

  emptyMsg.style.display = tasks.length === 0 ? "block" : "none";

}

function renderTasks(){
 const taskList =
 document.getElementById("taskList");

 taskList.innerHTML="";
 
 checkEmpty();

 tasks.forEach((task,index)=>{
  const li=document.createElement("li");
  li.setAttribute("draggable", true);
  li.classList.add("task-card");

li.addEventListener("dragstart", (e) => {
  e.dataTransfer.setData("text/plain", index);
});

li.addEventListener("dragover", (e) => {
  e.preventDefault();
});

li.addEventListener("drop", (e) => {
  e.preventDefault();

  const fromIndex = e.dataTransfer.getData("text/plain");
  const toIndex = index;

  const movedTask = tasks.splice(fromIndex, 1)[0];
  tasks.splice(toIndex, 0, movedTask);

  saveTasks();
});
  
  li.classList.add(task.priority);
  
 li.innerHTML=`
   <div class="task-info">

    <span class="${task.completed ? "completed" : ""}">
      ${task.text}
    </span>

    <small>Due: ${task.date || "No Date"}</small>
    <small>Status: ${task.completed ? "Completed" : "Pending"}
</small>

</div>

<div class="task-buttons">

<button onclick="toggleTask(${index})">
 ${task.completed ? "Undo" : "Done"}
</button>

<button onclick="editTask(${index})">
 Edit
</button>

<button onclick="deleteTask(${index})">
 Delete
</button>

</div>
`;

taskList.appendChild(li);

});

updateStats();
}

function toggleTask(index){
 tasks[index].completed = !tasks[index].completed;
 saveTasks();
}

function editTask(index){
let updatedTask = prompt("Edit Task",tasks[index].text);

if(updatedTask){
 tasks[index].text = updatedTask;
 saveTasks();
 }
}

function deleteTask(index){
 tasks.splice(index,1);
 saveTasks();
}

function updateStats(){
 document.getElementById("total").innerText = tasks.length;

 document.getElementById("completed").innerText = 
 tasks.filter(task=>task.completed).length;

document.getElementById("pending").innerText =
tasks.filter(task=>!task.completed).length;
}

function searchTask(){
 const input =document
 .getElementById("searchInput")
 .value.toLowerCase();

const items = document.querySelectorAll("#taskList li");

items.forEach(item=>{
 const text = item.innerText.toLowerCase();

if(text.includes(input)){
 item.style.display="flex";
} else {
  item.style.display="none";
   }
  });
}


window.addEventListener() = function(){
 if(localStorage.getItem("isLoggedIn")){
  const savedUser = localStorage.getItem("lastUser");

currentUser = savedUser;

tasks =
 JSON.parse(localStorage.getItem("tasks_"+savedUser)) || [];

document.getElementById("auth-section").style.display="none";
document.getElementById("app-section").style.display="block";

renderTasks();
}
};
