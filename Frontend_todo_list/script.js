var data = [];
var color = "#2196f3";

var API = "http://localhost:3000/api";

var app = document.getElementById("app");
var folderName = document.getElementById("folderName");

// Load all data from backend on start
function loadData() {
  // Fetch all data from the backend API and update the frontend "http://localhost:3000/api/all" endpoint. 
  // The response is expected to be in JSON format, which is then stored in the "data" variable and rendered on the frontend.
  fetch(API + "/all")
    .then((res) => { return res.json(); })
    .then((result) =>{
      //console.log(result);
      // //outputs:{ folders: [...], subfolders: [...], tasks: [...] }
      data = result;
      render();
    })
    .catch((err)=>{
      console.error("Failed to load data:", err);
    });
}

// Handle color selection for folders
//This code is a color-picker button system. 
// It finds all buttons inside #colors, gives each button its color,
//  and makes the clicked button become the selected color.
document.querySelectorAll("#colors button").forEach((btn) =>{
  // Set the button's background color based on its data-color attribute
  // btn.dataset.color = btn.getAttribute("data-color"); that means "#2196f3" or other color values
  btn.style.background = btn.dataset.color;

  btn.onclick = ()=>{
    color = btn.dataset.color;
    //Take every button that was found and run this code once for each button
    document.querySelectorAll("#colors button")
      .forEach((b) => { b.classList.remove("selected"); });
    btn.classList.add("selected");
  };
});

document.getElementById("addFolder").onclick = ()=>{
  var name = folderName.value.trim();
  if (!name) return;

  fetch(API + "/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name, color: color })
  })
    .then((res)=> { return res.json(); })
    .then(()=>{
      folderName.value = "";
      loadData();
    })
    .catch((err) => { console.error(err); });
};

document.getElementById("clear").onclick = ()=>{
  folderName.value = "";
};

folderName.onkeydown =  (e) =>{
  if (e.key === "Enter") document.getElementById("addFolder").click();
};





// result={
//   "folders": [
//     {
//       "id": 1,
//       "name": "Personal Projects",
//       "created_at": "2026-10-01T10:00:00Z"
//     },

//     {
//       "id": 2,
//       "name": "University",
//       "created_at": "2026-10-02T11:30:00Z"
//     }
//   ],

//   "subfolders": [
//     {
//       "id": 101,
//       "folder_id": 1,
//       "name": "Task Manager Web App",
//       "created_at": "2026-10-01T10:05:00Z"
//     },

//     {
//       "id": 102,
//       "folder_id": 1,
//       "name": "Portfolio Website",
//       "created_at": "2026-10-01T10:10:00Z"
//     },

//     {
//       "id": 103,
//       "folder_id": 2,
//       "name": "Database Systems Course",
//       "created_at": "2026-10-02T11:35:00Z"
//     }
//   ],

//   "tasks": [
//     {
//       "id": 501,
//       "subfolder_id": 101,
//       "name": "Set up Express server & MySQL connection",
//       "done": 1,
//       "due": "2026-10-10",
//       "created_at": "2026-10-01T10:15:00Z"
//     },

//     {
//       "id": 502,
//       "subfolder_id": 101,
//       "name": "Create POST /tasks API endpoint",
//       "done": 0,
//       "due": "2026-10-12",
//       "created_at": "2026-10-01T10:20:00Z"
//     },

//     {
//       "id": 503,
//       "subfolder_id": 103,
//       "name": "Prepare for Concurrency Control quiz",
//       "done": 0,
//       "due": null,
//       "created_at": "2026-10-02T11:40:00Z"
//     }

//   ]
// }





function render() {
  app.innerHTML = data.map((f)=>{
    return '<div class="folder" style="border-color:' + f.color + '">' +
      '<div class="row">' +
        '<span class="folder-name">' + f.name + '</span>' +
        '<span class="actions">' +
          '<button onclick="addSub(' + f.id + ')">＋ SubFolder</button>' +
          '<button onclick="editFolder(' + f.id + ')">✎</button>' +
          '<button onclick="delFolder(' + f.id + ')">🗑</button>' +
        '</span>' +
      '</div>' +

     
      f.subfolders.map((s) => {
        //  console.log(s.subfolders); 
        return '<div class="subfolder">' +
          '<div class="row">' +
            '<span class="subfolder-name">' + s.name + '</span>' +
            '<span class="actions">' +
              '<button onclick="addTask(' + f.id + ',' + s.id + ')">＋ Task</button>' +
              '<button onclick="editSub(' + f.id + ',' + s.id + ')">✎</button>' +
              '<button onclick="delSub(' + f.id + ',' + s.id + ')">🗑</button>' +
            '</span>' +
          '</div>' +
          s.tasks.map((t, i)=> {
            return '<div class="task ' + (t.done ? "done" : "") + '">' +
              '<div class="row">' +
                '<span class="title">' + (i + 1) + '. ' + t.name + '</span>' +
                '<span class="actions">' +
                  '<button onclick="toggle(' + f.id + ',' + s.id + ',' + t.id + ')">' +
                    (t.done ? "✔" : "○") +
                  '</button>' +
                  '<button onclick="editTask(' + f.id + ',' + s.id + ',' + t.id + ')">✎</button>' +
                  '<button onclick="delTask(' + f.id + ',' + s.id + ',' + t.id + ')">🗑</button>' +
                '</span>' +
              '</div>' +
              '<span class="badge ' + (t.done ? "completed" : "expired") + '">' +
                (t.done ? "Completed" : "Expired") +
              '</span>' +
              (t.due ? '<div class="small">⏰ ' + t.due + '</div>' : '') +
            '</div>';
          }).join("") +
          (s.adding ? '<div class="add-box">' +
            '<input id="task-' + s.id + '" placeholder="Task name...">' +
            '<button onclick="createTask(' + f.id + ',' + s.id + ')">✓</button>' +
          '</div>' : '') +
        '</div>';
      }).join("") +
      (f.adding ? '<div class="add-box">' +
        '<input id="sub-' + f.id + '" placeholder="SubFolder name...">' +
        '<button onclick="createSub(' + f.id + ')">✓</button>' +
      '</div>' : '') +
    '</div>';
  }).join("");
}

function addSub(fid) {
  var f = data.find(function (x) { return x.id === fid; });
  f.adding = true;
  render();
  var el = document.getElementById("sub-" + fid);
  if (el) el.focus();
}

function createSub(fid) {
  var input = document.getElementById("sub-" + fid);
  var name = input.value.trim();
  if (!name) return;

  fetch(API + "/subfolders/" + fid, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name })
  })
    .then(function (res) { return res.json(); })
    .then(()=>{ loadData(); })
    .catch(function (err) { console.error(err); });
}

function addTask(fid, sid) {
  var f = data.find(function (x) { return x.id === fid; });
  var s = f.subfolders.find(function (x) { return x.id === sid; });
  s.adding = true;
  render();
  var el = document.getElementById("task-" + sid);
  if (el) el.focus();
}

function createTask(fid, sid) {
  var input = document.getElementById("task-" + sid);
  var name = input.value.trim();
  if (!name) return;

  fetch(API + "/tasks/" + sid, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name, due: new Date().toLocaleString() })
  })
    .then(function (res) { return res.json(); })
    .then(()=>{ loadData(); })
    .catch(function (err) { console.error(err); });
}

function toggle(fid, sid, tid) {
  fetch(API + "/tasks/" + tid + "/toggle", {
    method: "PATCH"
  })
    .then(function (res) { return res.json(); })
    .then(()=>{ loadData(); })
    .catch(function (err) { console.error(err); });
}

function getTask(fid, sid, tid) {
  return data.find(function (f) { return f.id === fid; })
    .subfolders.find(function (s) { return s.id === sid; })
    .tasks.find(function (t) { return t.id === tid; });
}

function delTask(fid, sid, tid) {
  fetch(API + "/tasks/" + tid, { method: "DELETE" })
    .then(function (res) { return res.json(); })
    .then(()=>{ loadData(); })
    .catch(function (err) { console.error(err); });
}

function delSub(fid, sid) {
  fetch(API + "/subfolders/" + sid, { method: "DELETE" })
    .then(function (res) { return res.json(); })
    .then(()=>{ loadData(); })
    .catch(function (err) { console.error(err); });
}

function delFolder(fid) {
  fetch(API + "/folders/" + fid, { method: "DELETE" })
    .then(function (res) { return res.json(); })
    .then(()=>{ loadData(); })
    .catch(function (err) { console.error(err); });
}

function editFolder(fid) {
  var f = data.find(function (x) { return x.id === fid; });
  var name = prompt("Folder name:", f.name);

  if (name && name.trim()) {
    fetch(API + "/folders/" + fid, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() })
    })
      .then(function (res) { return res.json(); })
      .then(()=>{ loadData(); })
      .catch(function (err) { console.error(err); });
  }
}

function editSub(fid, sid) {
  var s = data.find(function (f) { return f.id === fid; })
    .subfolders.find(function (x) { return x.id === sid; });
  var name = prompt("SubFolder name:", s.name);

  if (name && name.trim()) {
    fetch(API + "/subfolders/" + sid, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() })
    })
      .then(function (res) { return res.json(); })
      .then(()=>{ loadData(); })
      .catch(function (err) { console.error(err); });
  }
}

function editTask(fid, sid, tid) {
  var t = getTask(fid, sid, tid);
  var name = prompt("Task:", t.name);

  if (name && name.trim()) {
    fetch(API + "/tasks/" + tid, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() })
    })
      .then(function (res) { return res.json(); })
      .then(()=>{ loadData(); })
      .catch(function (err) { console.error(err); });
  }
}

document.getElementById("analytics").onclick = ()=>{
  fetch(API + "/analytics")
    .then(function (res) { return res.json(); })
    .then(function (stats) {
      alert(
        "Analytics\n\n" +
        "Folders: " + stats.folders + "\n" +
        "SubFolders: " + stats.subfolders + "\n" +
        "Tasks: " + stats.tasks + "\n" +
        "Completed: " + stats.completed + "\n" +
        "Expired: " + stats.expired
      );
    })
    .catch(function (err) { console.error(err); });
};

// Initial load
loadData();