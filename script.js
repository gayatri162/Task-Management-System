let tasks = [];
let currentUser = "";

window.addEventListener("DOMContentLoaded", () => {
 const addBtn = document.querySelector(".add-btn");
 if (addBtn) addBtn.addEventListener("click", addTask);

 const clearBtn = document.getElementById("clearAllBtn");
 if (clearBtn) {
    clearBtn.addEventListener("click", function () {
     if(confirm("Delete all tasks?")){
       tasks = [];
       saveTasks();
}
    });
 }

 const taskInput = document.getElementById("taskInput");
  if (taskInput) {
    taskInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") addTask();
    });
  }
});

function setGreeting(){
 const heading =
 document.getElementById("greeting");
 if(!heading) return;

 const hour = new Date().getHours();
 let msg = "Good Morning";

 if(hour >= 12 && hour < 18){
   msg = "Good Afternoon";
 }
 else if(hour >= 18){
   msg = "Good Evening";
 }
 heading.innerText =
 `${msg}, ${currentUser} 👋`;
}

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
 
if(!username || !password){
  alert("Enter Username and Password");
  return;
}

localStorage.setItem("username",username);
localStorage.setItem("password",password);
localStorage.setItem("lastUser", username);
localStorage.setItem("isLoggedIn","true");


currentUser = username;

tasks =
JSON.parse(
localStorage.getItem("tasks_"+username)
) || [];

alert("Signup Successful");

document.getElementById("auth-section").style.display="none";
document.getElementById("app-section").style.display="grid";

renderTasks();
setGreeting();
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

document.getElementById("app-section").style.display="grid";

renderTasks();
setGreeting();
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
 priority: priority,
 important:false
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
   
<div class="task-row">

<div class="left">

<label class="check-container">
<input
type="checkbox"
${task.completed ? "checked" : ""}
onchange="toggleTask(${index})">
</label>

</div>

<div class="center">

<span class="${task.completed ? "completed" : ""}">
${task.text}
</span>

<small>
📅 ${task.date || "No Date"}
</small>

<span class="badge ${task.priority}">
${task.priority}
</span>

</div>

<div class="right">

<button
class="important-btn ${task.important ? "active" : ""}"
onclick="toggleImportant(${index})">
${task.important ? "★" : "☆"}
</button>

<button onclick="editTask(${index})">
Edit
</button>

<button onclick="deleteTask(${index})">
Delete
</button>

</div>

</div>`

taskList.appendChild(li);

});

updateStats();
updateUpcoming();
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
if(confirm("Delete this task?")){
 tasks.splice(index,1);
 saveTasks();
}
}

function toggleImportant(index){
 tasks[index].important =
 !tasks[index].important;
 saveTasks();
}

function updateStats(){
 document.getElementById("total").innerText = tasks.length;
 
const completed =
tasks.filter(task=>task.completed).length;

const percent =
tasks.length
? (completed/tasks.length)*360
: 0;

document
.querySelector(".circle")
.style.setProperty(
"--progress",
`${percent}deg`
);

 document.getElementById("circleTotal").innerText = 
 `${completed}/${tasks.length}`;

 document.getElementById("completed").innerText = 
 tasks.filter(task=>task.completed).length;

document.getElementById("pending").innerText =
tasks.filter(task=>!task.completed).length;

document.getElementById(
"allCount"
).innerText =
tasks.length;

document.getElementById(
"importantCount"
).innerText =
tasks.filter(
t=>t.important
).length;

document.getElementById(
"completedCount"
).innerText =
tasks.filter(
t=>t.completed
).length;
}

function searchTask(){
 const input =document
 .getElementById("searchInput")
 .value.toLowerCase();

const items = document.querySelectorAll("#taskList li");

items.forEach(item=>{
 const text = item.innerText.toLowerCase();

if(text.includes(input)){
 item.style.display="block";
} else {
  item.style.display="none";
   }
  });
}


function updateUpcoming(){
 const list =
 document.getElementById("upcomingList");

if(!list) return;

const upcoming =
 tasks
.filter(
task =>
task.date &&
!task.completed
)
 .sort(
 (a,b)=>
 new Date(a.date) -
 new Date(b.date)
 )
 .slice(0,3);

if(upcoming.length === 0){
list.innerHTML =
"<li>No upcoming tasks</li>";
return;
}

 list.innerHTML = "";

 upcoming.forEach(task=>{
  list.innerHTML += `
  <li>
  <strong>${task.text}</strong>
  <br>
  <small>📅 ${task.date}</small>
  <br>
  <small>🔥 ${task.priority}</small> 
  </li>
  `;
 });

if(tasks.length === 0){
 list.innerHTML = 
 "<li>No upcoming tasks</li>";
 return;
}

}

window.addEventListener("load", function(){  
 if(localStorage.getItem("isLoggedIn")){
  const savedUser = localStorage.getItem("lastUser");

currentUser = savedUser;

tasks =
 JSON.parse(localStorage.getItem("tasks_"+savedUser)) || [];

document.getElementById("auth-section").style.display="none";
document.getElementById("app-section").style.display="grid";

renderTasks();
setGreeting();
}
});

document
.getElementById("allTasks")
.addEventListener(
"click",
()=>renderTasks()
);

document
.getElementById("completedTasks")
.addEventListener(
"click",
()=>filterTasks("completed")
);

document
.getElementById("importantTasks")
.addEventListener(
"click",
()=>filterTasks("high")
);

function filterTasks(type){

const taskList =
document.getElementById("taskList");

taskList.innerHTML="";

let filtered = [];

if(type==="completed"){

filtered =
tasks.filter(
task=>task.completed
);

}
else if(type==="high"){

filtered =
tasks.filter(
task=>task.important
);

}
renderFiltered(filtered);
}

function renderFiltered(filtered){

if(filtered.length === 0){
taskList.innerHTML = `
<p id="emptyMsg">
No Important Tasks ⭐
</p>
`;
return;
}

const taskList =
document.getElementById("taskList");

taskList.innerHTML = "";

filtered.forEach((task,index)=>{

const li = document.createElement("li");

li.innerHTML = `
<div class="task-row">

<div class="center">

<span class="${task.completed ? "completed" : ""}">
${task.text}
</span>

<small>📅 ${task.date || "No Date"}
</small>

${task.important ? "<small>⭐ Important</small>" : ""}

<span class="badge ${task.priority}">
${task.priority}
</span>
</div>

</div>
`;

taskList.appendChild(li);

});

}
