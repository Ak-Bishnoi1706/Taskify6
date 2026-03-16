    let selectedDay = null;
      let tasks = {};
      const maxTasks = 6;

// DropDown
      function showDaySelect() {
        document.getElementById("daySelect").classList.remove("hidden");
      }

// Dark/light Mode
function switchMode() {
    document.body.classList.toggle('dark');
    document.getElementById('sun').classList.toggle('hidden');
    document.getElementById('moon').classList.toggle('hidden');

    const isDark = document.body.classList.contains("dark");
    loadParticles(isDark ? "dark" : "light");
}

// Save selected day
      function selectDay(day) {
        selectedDay = day;

// Highlight selected day
        document.querySelectorAll(".day").forEach(d => d.classList.remove("ring", "ring-blue-400"));
        document.getElementById(day).classList.add("ring", "ring-blue-400");
      }

// To add tasks inside section
      function addTask() {
        const Input = document.getElementById("taskInput");

    // Input validation
        if (Input.value.trim() === "") {
            alert("Task cannot be empty!");
            return;
        }

    // Alert - Select day first
        if (!selectedDay) {
          alert("Please select a day first!");
          return;
        }

    // Alert - length of tasks 6
        if (!tasks[selectedDay]) tasks[selectedDay] = [];
        if (tasks[selectedDay].length >= maxTasks) {
          alert("only 6 tasks allowed for " + selectedDay);
          return;
        }

    // append user respond into html
        const task = {
          text: Input.value,
          completed: false,
        };
        tasks[selectedDay].push(task);

        renderTasks(selectedDay);
        Input.value = "";
        saveTasks();
      }

// Displaying each task in HTML
      function renderTasks(day) {
        const list = document.getElementById("taskList-" + day);
        list.innerHTML = "";

        if (!tasks[day]) return;

    // Append each task into list
        tasks[day].forEach((task, index) => {
          const li = document.createElement("li");
          li.className =
            "flex justify-between items-center bg-white dark:bg-gray-500 p-2 rounded shadow";

    // mark as completed / incompleted
          const tick = document.createElement("input");
          tick.type = "checkbox";
          tick.checked = task.completed;
          tick.className = "w-4 h-4 text-green-600 rounded-lg focus:ring-green-400 cursor-pointer m-2";
          tick.onclick = () => toggleTask(day, index);

    // text inside list
          const textSpan = document.createElement("span");
          textSpan.textContent = task.text;
        //   textSpan.className = task.completed ? "line-through text-gray-500 ml-2" : "ml-2 text-black";
        if (task.completed) {
            textSpan.className = "line-through text-gray-500 dark:text-gray-300";
        } else {
            textSpan.className = "text-gray-800 dark:text-gray-100";
        }

    // EDit button
            const editBtn = document.createElement("button");
          editBtn.textContent = "✏";
          editBtn.className =
            "ml-auto mr-2 text-blue-500 bg-blue-300 rounded px-2 hover:bg-blue-600 transition duration-200";
          editBtn.onclick = () => {
            const newText = prompt("Edit your task: ", task.text);
            if (newText !== null && newText.trim() !== "") {
              task.text = newText.trim();
              renderTasks(day);
              saveTasks();
            }
          };

    // Delete button
          const delBtn = document.createElement("button");
          delBtn.textContent = "❌";
          delBtn.className =
            "text-red-500 bg-red-300 rounded-lg px-2 hover:bg-red-700 transition duration-200";
          delBtn.onclick = () => {
            tasks[day].splice(index, 1);
            renderTasks(day);
            saveTasks();
          };

    // adding elements into main list
          li.appendChild(tick);
          li.appendChild(textSpan);
          li.appendChild(editBtn);
          li.appendChild(delBtn);
          list.appendChild(li);
        });
      }

// Check if task completed for a day
      function toggleTask(day, index) {
        tasks[day][index].completed = !tasks[day][index].completed;
        renderTasks(day);
        saveTasks();

        if(tasks[day][index].completed) {
            taskCompleted();
        }
        checkDayComplete(day);
      }

// Save tasks
      function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }

// load Tasks from localStorage
      function loadTasks() {
        const saved = localStorage.getItem("tasks");
        if (saved) {
          tasks = JSON.parse(saved);
          Object.keys(tasks).forEach((day) => renderTasks(day));
        }
      }

// show report
let progressChart = null; // global variable

function showAnalysis() {
  const allTasks = Object.values(tasks).flat();
  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.completed).length;
  const incomplete = total - completed;
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById("analysisResult").textContent =
    `Completed: ${completed}, Incomplete: ${incomplete}, Progress: ${percentage}%`;

  const ctx = document.getElementById("progressChart").getContext("2d");

  // Destroy the older chart
  if (progressChart) {
    progressChart.destroy();
  }

  // Create new chart and store into global variable
  progressChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Completed", "Incomplete"],
      datasets: [
        {
          data: [completed, incomplete],
          backgroundColor: ["#4CAF50", "#FF5252"],
        },
      ],
    },
    options: {
        responsive: false,
        maintainAspectRatio: false
    }
  });
}

// Particles init
function loadParticles(theme) {
  particlesJS("particles-js", {
    particles: {
      number: { value: 120 },
      color: { value: theme === "dark" ? "#4CAF50" : "#008000" },
      shape: { type: "circle" },
      opacity: { value: 0.8 },
      size: { value: 4 },
      links: {
        enable: true,
        distance: 150,
        color: theme === "dark" ? "#81C784" : "#008000",
        opacity: 0.6,
        width: 1
      },
      move: { 
        enable: true, 
        speed: 2,
        random: true,
        straight: false,
        out_mode: "out"
    },
    },
    interactivity: {
      events: {
        onhover: { enable: false }, // particles connect on hover
        onclick: { enable: true, mode: "push" } // add new particles on click
      },
      modes: {
        // grab: { distance: 200, line_linked: { opacity: 0.8 } },
        push: { particles_nb: 5 }
      },
    },
    retina_detect: true
  });
}

// Streak manager
    let streak = 0;
    let lastCompletedDate = null;

// Load streak from localStorage
function loadStreak() {
  const savedStreak = localStorage.getItem("streak");
  const savedDate = localStorage.getItem("lastCompletedDate");

  if (savedStreak) streak = parseInt(savedStreak);
  if (savedDate) lastCompletedDate = savedDate;

  updateStreakUI();
}

// Update streak UI
function updateStreakUI() {
  document.getElementById("streakCount").textContent = `Current Streak: ${streak} days`;
}

// Call when a task is marked completed
function taskCompleted() {
  const today = new Date().toDateString();

  if (lastCompletedDate === today) {
    // already counted today
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastCompletedDate === yesterday.toDateString()) {
    streak++; // continue streak
  } else {
    streak = 1; // reset streak
  }

  lastCompletedDate = today;
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastCompletedDate", lastCompletedDate);

  updateStreakUI();
}

// Motivational quotes
    const quotes = [
        'Consistency beats intensity.',
        'Small steps every day build big results.',
        'Your future self will thank you.',
        'Discipline is the bridge between goals and success.',
        'Focus on progress, not perfection.',
        'The best way to get started is to quit talking and begin doing.'
    ];

// To show random quote
   let quoteIndex = 0;
   let charIndex = 0;
   let isDeleting = false;
   const container = document.getElementById("quoteText");

   function typeEffect() {
     const currentQuote = quotes[quoteIndex];

     if (!isDeleting && charIndex < currentQuote.length) {
       // Typing forward
       container.textContent = currentQuote.substring(0, charIndex + 1);
       charIndex++;
       setTimeout(typeEffect, 100); // typing speed
     } else if (isDeleting && charIndex > 0) {
       // Backspacing
       container.textContent = currentQuote.substring(0, charIndex - 1);
       charIndex--;
       setTimeout(typeEffect, 50); // backspace speed
     } else {
       if (!isDeleting) {
         // Pause before deleting
         isDeleting = true;
         setTimeout(typeEffect, 1500); // wait before erase
       } else {
         // Move to next quote
         isDeleting = false;
         quoteIndex = (quoteIndex + 1) % quotes.length;
         setTimeout(typeEffect, 500); // small pause before next typing
       }
     }
   }

   // Start effect
   typeEffect();

//   History saving
let history = {};

   // check if all tasks of a day
   function checkDayComplete(day) {
     if (
       tasks[day] &&
       tasks[day].length > 0 &&
       tasks[day].every((t) => t.completed)
     ) {
       if (!history[day]) history[day] = [];
       history[day].push(...tasks[day]); // copy completed tasks
       localStorage.setItem("history", JSON.stringify(history));
       renderHistory();
     }
   }

   // Render history container
   function renderHistory() {
     const historyList = document.getElementById("historyList");
     historyList.innerHTML = "";

     Object.keys(history).forEach((day) => {
       const card = document.createElement("div");
       card.className = "p-3 bg-white dark:bg-gray-600 rounded shadow";

       const title = document.createElement("h3");
       title.textContent = `Day: ${day}`;
       title.className = "font-semibold text-gray-800 dark:text-gray-100 mb-2";

       const ul = document.createElement("ul");
       history[day].forEach((task) => {
         const li = document.createElement("li");
         li.textContent = task.text;
         li.className = "text-sm text-green-700 dark:text-green-300";
         ul.appendChild(li);
       });

       card.appendChild(title);
       card.appendChild(ul);
       historyList.appendChild(card);
     });
   }

   // Load history from localStorage
function loadHistory() {
  const savedHistory = localStorage.getItem("history");
  if (savedHistory) {
    history = JSON.parse(savedHistory);
    renderHistory();
  }
}

// Clear history
    function clearHistory() {
        history = {};
        localStorage.removeItem("history");
        document.getElementById("historyList").innerHTML = "";
        alert('Task History Cleared');
    }

// Enter key shortcut
      document.getElementById("taskInput").addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            addTask();
          }
          });
        
window.onload = () => {
            loadTasks();
            loadParticles("light");   
            loadStreak();     
            loadHistory();
          }