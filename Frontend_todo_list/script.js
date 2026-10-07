var data = [];
var color = "#2196f3";

var API = "http://localhost:3000/api";

var app = document.getElementById("app");
var folderName = document.getElementById("folderName");

// Load all data from backend on start
function loadData() {
  fetch(API + "/all")
    .then(function (res) { return res.json(); })
    .then(function (result) {
      data = result;
      render();
    })
    .catch(function (err) {
      console.error("Failed to load data:", err);
    });
}

document.querySelectorAll("#colors button").forEach(function (btn) {
  btn.style.background = btn.dataset.color;

  btn.onclick = function () {
    color = btn.dataset.color;
    document.querySelectorAll("#colors button")
      .forEach(function (b) { b.classList.remove("selected"); });
    btn.classList.add("selected");
  };
});

document.getElementById("addFolder").onclick = function () {
  var name = folderName.value.trim();
  if (!name) return;

  fetch(API + "/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name, color: color })
  })
    .then(function (res) { return res.json(); })
    .then(function () {
      folderName.value = "";
      loadData();
    })
    .catch(function (err) { console.error(err); });
};

document.getElementById("clear").onclick = function () {
  folderName.value = "";
};

folderName.onkeydown = function (e) {
  if (e.key === "Enter") document.getElementById("addFolder").click();
};

function render() {
  app.innerHTML = data.map(function (f) {
    return '<div class="folder" style="border-color:' + f.color + '">' +
      '<div class="row">' +
        '<span class="folder-name">' + f.name + '</span>' +
        '<span class="actions">' +
          '<button onclick="addSub(' + f.id + ')">＋ SubFolder</button>' +
          '<button onclick="editFolder(' + f.id + ')">✎</button>' +
          '<button onclick="delFolder(' + f.id + ')">🗑</button>' +
        '</span>' +
      '</div>' +
      f.subfolders.map(function (s) {
        return '<div class="subfolder">' +
          '<div class="row">' +
            '<span class="subfolder-name">' + s.name + '</span>' +
            '<span class="actions">' +
              '<button onclick="addTask(' + f.id + ',' + s.id + ')">＋ Task</button>' +
              '<button onclick="editSub(' + f.id + ',' + s.id + ')">✎</button>' +
              '<button onclick="delSub(' + f.id + ',' + s.id + ')">🗑</button>' +
            '</span>' +
          '</div>' +
          s.tasks.map(function (t, i) {
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
    .then(function () { loadData(); })
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
    .then(function () { loadData(); })
    .catch(function (err) { console.error(err); });
}

function toggle(fid, sid, tid) {
  fetch(API + "/tasks/" + tid + "/toggle", {
    method: "PATCH"
  })
    .then(function (res) { return res.json(); })
    .then(function () { loadData(); })
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
    .then(function () { loadData(); })
    .catch(function (err) { console.error(err); });
}

function delSub(fid, sid) {
  fetch(API + "/subfolders/" + sid, { method: "DELETE" })
    .then(function (res) { return res.json(); })
    .then(function () { loadData(); })
    .catch(function (err) { console.error(err); });
}

function delFolder(fid) {
  fetch(API + "/folders/" + fid, { method: "DELETE" })
    .then(function (res) { return res.json(); })
    .then(function () { loadData(); })
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
      .then(function () { loadData(); })
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
      .then(function () { loadData(); })
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
      .then(function () { loadData(); })
      .catch(function (err) { console.error(err); });
  }
}

document.getElementById("analytics").onclick = function () {
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