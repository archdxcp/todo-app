const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("todoList");
const filterAll = document.getElementById("filter-all");
const filterActive = document.getElementById("filter-active");
const filterDone = document.getElementById("filter-done");

let isComposing = false;
let draggedItem = null;
addBtn.addEventListener("click", () => {
  const text = input.value;

  if (text === "") return;

  const li = document.createElement("li");
  li.addEventListener("dragstart", () => {
    draggedItem = li;
    li.classList.add("dragging");
  });
  
  li.addEventListener("dragend", () => {
    draggedItem = null;
    li.classList.remove("dragging");
    saveTodos(); // 並び替え後に保存
  });
  li.draggable = true;

  const span = document.createElement("span");
  span.textContent = text;
  span.addEventListener("click", () => {
    li.classList.toggle("done");
    saveTodos();
  });
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = text;
  editInput.style.display = "none";

  span.addEventListener("dblclick", () => {
    editInput.style.display = "inline";
    span.style.display = "none";
    editInput.focus();
  });
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !isComposing) {
        span.textContent = editInput.value;
        span.style.display = "inline";
        editInput.style.display = "none";
        saveTodos();
      }
    
      if (e.key === "Escape") {
        editInput.value = span.textContent;
        span.style.display = "inline";
        editInput.style.display = "none";
      }
    });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTodos(); // ←② 削除で保存
  });

  li.appendChild(span);
  li.appendChild(editInput);
  li.appendChild(deleteBtn);
  list.appendChild(li);

  input.value = "";
  saveTodos(); // ←③ 追加した直後に保存
});

// 日本語変換中かどうかを判定
input.addEventListener("compositionstart", () => {
  isComposing = true;
});
input.addEventListener("compositionend", () => {
  isComposing = false;
});
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !isComposing) {
    addBtn.click();
  }
});
// Enterキーで追加（変換中は無視）
function saveTodos() {
  const todos = [];
  document.querySelectorAll("#todoList li span").forEach(span => {
    todos.push({
      text: span.textContent,
      done: span.parentElement.classList.contains("done")
    });
  });
  localStorage.setItem("todos", JSON.stringify(todos));
}
window.addEventListener("load", () => {
  const saved = localStorage.getItem("todos");
  if (!saved) return;

  const todos = JSON.parse(saved);

  todos.forEach(todo => {
    const li = document.createElement("li");

    if (todo.done) li.classList.add("done");

    const span = document.createElement("span");
    span.textContent = todo.text;

    span.addEventListener("click", () => {
      li.classList.toggle("done");
      saveTodos();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
      li.remove();
      saveTodos();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

});
list.addEventListener("dragover", (e) => {
  e.preventDefault();

  const afterElement = getDragAfterElement(list, e.clientY);
  const dragging = draggedItem;

  if (!dragging) return;

  if (afterElement == null) {
    list.appendChild(dragging);
  } else {
    list.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll("li:not(.dragging)")
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
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
function filterTodos(type) {
  document.querySelectorAll("#todoList li").forEach(li => {
    if (type === "all") {
      li.style.display = "flex";
    } else if (type === "active") {
      li.style.display = li.classList.contains("done") ? "none" : "flex";
    } else if (type === "done") {
      li.style.display = li.classList.contains("done") ? "flex" : "none";
    }
  });
}
filterAll.addEventListener("click", () => filterTodos("all"));
filterActive.addEventListener("click", () => filterTodos("active"));
filterDone.addEventListener("click", () => filterTodos("done"));

const darkToggle = document.getElementById("darkToggle");

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});