// ************* index.html *************
// Set the date we're counting down to
const countDownDate = new Date("2025-06-22T09:00:00").getTime();

// Update the count down every 1 second
const x = setInterval(function () {
  const now = new Date().getTime();
  const distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="countdown"
  document.getElementById("countdown").innerHTML = `
  <div class="countdown-container">
    <div class="countdown-item">
      <span class="countdown-number">${days}</span>
      <span class="countdown-label">يوم</span>
    </div>
    <div class="countdown-item">
      <span class="countdown-number">${hours}</span>
      <span class="countdown-label">ساعة</span>
    </div>
    <div class="countdown-item">
      <span class="countdown-number">${minutes}</span>
      <span class="countdown-label">دقيقة</span>
    </div>
    <div class="countdown-item">
      <span class="countdown-number">${seconds}</span>
      <span class="countdown-label">ثانية</span>
    </div>
  </div>
`;

  // Also update mini countdown
  const miniCountdown = document.getElementById("mini-countdown");
  if (distance < 0) {
    miniCountdown.innerHTML = "الامتحان قد بدأ!";
  } else {
    miniCountdown.innerHTML = `
      <div class=\"countdown-container mini\">
        <div class=\"countdown-item\">
          <span class=\"countdown-number\">${days}</span>
          <span class=\"countdown-label\">يوم</span>
        </div>
        <div class=\"countdown-item\">
          <span class=\"countdown-number\">${hours}</span>
          <span class=\"countdown-label\">ساعة</span>
        </div>
        <div class=\"countdown-item\">
          <span class=\"countdown-number\">${minutes}</span>
          <span class=\"countdown-label\">دقيقة</span>
        </div>
        <div class=\"countdown-item\">
          <span class=\"countdown-number\">${seconds}</span>
          <span class=\"countdown-label\">ثانية</span>
        </div>
      </div>
    `;
  }

  // If the count down is over, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("countdown").innerHTML = "الامتحان قد بدأ!";
  }
}, 1000);

// To-Do List Logic
const todoSections = Array.from(document.querySelectorAll(".todo-section"));
const TASKS_KEY = "exam_tasks_status";
let tasksStatus = JSON.parse(localStorage.getItem(TASKS_KEY));
if (
  !Array.isArray(tasksStatus) ||
  tasksStatus.length !== todoSections.length
) {
  // Re-initialize if corrupted or mismatched
  tasksStatus = Array.from({ length: todoSections.length }, () => []);
}

// --- Custom Tasks Integration ---
const CUSTOM_TASKS_KEY = "exam_tasks_custom";
let customTasks = JSON.parse(localStorage.getItem(CUSTOM_TASKS_KEY));
if (
  !Array.isArray(customTasks) ||
  customTasks.length !== todoSections.length
) {
  customTasks = Array.from({ length: todoSections.length }, () => []);
}
// Build a flat list of all tasks (default + custom) for each section
const allTasks = todoSections.map((section, sectionIdx) => {
  const defaultTasks = Array.from(
    section.querySelectorAll(".todo-item:not(.custom-task) .todo-title")
  ).map((e) => e.textContent.trim());
  return [...defaultTasks, ...(customTasks[sectionIdx] || [])];
});
// Ensure tasksStatus matches the number of tasks in each section
allTasks.forEach((tasks, sectionIdx) => {
  if (!Array.isArray(tasksStatus[sectionIdx])) tasksStatus[sectionIdx] = [];
  // Add missing slots as false
  while (tasksStatus[sectionIdx].length < tasks.length) {
    tasksStatus[sectionIdx].push(false);
  }
  // Remove extra slots
  while (tasksStatus[sectionIdx].length > tasks.length) {
    tasksStatus[sectionIdx].pop();
  }
});
localStorage.setItem(TASKS_KEY, JSON.stringify(tasksStatus));

todoSections.forEach((section, sectionIdx) => {
  const todoList = section.querySelector(".todo-list");
  // Remove all custom tasks (if any)
  todoList.querySelectorAll(".custom-task").forEach((e) => e.remove());
  // Add custom tasks
  (customTasks[sectionIdx] || []).forEach((task, i) => {
    const li = document.createElement("li");
    li.className = "todo-item custom-task";
    li.innerHTML = `<span class="todo-title">${task}</span><button class="done-btn" title="تم الإنجاز">✔️</button>`;
    todoList.appendChild(li);
    // Ensure tasksStatus array is large enough
    if (!tasksStatus[sectionIdx]) tasksStatus[sectionIdx] = [];
    if (
      typeof tasksStatus[sectionIdx][todoList.children.length - 1] !==
      "boolean"
    ) {
      tasksStatus[sectionIdx][todoList.children.length - 1] = false;
    }
  });
  // Save tasksStatus to localStorage after custom tasks are added, so the array length matches the UI
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasksStatus));
});

function updateTaskStyles() {
  todoSections.forEach((section, sectionIdx) => {
    const sectionTasks = tasksStatus[sectionIdx];
    section.querySelectorAll(".todo-item").forEach((item, idx) => {
      if (sectionTasks[idx]) {
        item.classList.add("done");
        item.classList.remove("not-done");
      } else {
        item.classList.remove("done");
        item.classList.add("not-done");
      }
    });
    // Add or update progress bar
    let progressBar = section.querySelector(".progress-bar");
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.className = "progress-bar";
      section.insertBefore(
        progressBar,
        section.querySelector(".todo-list")
      );
    }
    const doneCount = sectionTasks.filter(Boolean).length;
    const percent = Math.round((doneCount / sectionTasks.length) * 100);
    progressBar.innerHTML = `<div class=\"progress-track\"><div class=\"progress-fill\" style=\"width:${percent}%\"></div></div><span class=\"progress-text\">${percent}%</span>`;
  });
}

document
  .getElementById("todo-sections-grid")
  .addEventListener("click", function (e) {
    if (e.target.classList.contains("done-btn")) {
      const li = e.target.closest(".todo-item");
      const section = e.target.closest(".todo-section");
      const sectionIdx = Array.from(todoSections).indexOf(section);
      const idx = Array.from(
        section.querySelectorAll(".todo-item")
      ).indexOf(li);
      tasksStatus[sectionIdx][idx] = !tasksStatus[sectionIdx][idx];
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasksStatus));
      updateTaskStyles();
    }
  });

// Mini countdown show/hide on scroll
const mainCountdown = document.getElementById("countdown");
const miniCountdown = document.getElementById("mini-countdown");
function checkMiniCountdownVisibility() {
  const rect = mainCountdown.getBoundingClientRect();
  // If the bottom of the main countdown is above the top of the viewport, show mini
  if (rect.bottom < 250) {
    miniCountdown.style.display = "block";
  } else {
    miniCountdown.style.display = "none";
  }
}
window.addEventListener("scroll", checkMiniCountdownVisibility);
// Also check on load
checkMiniCountdownVisibility();

// On load, apply styles
updateTaskStyles();