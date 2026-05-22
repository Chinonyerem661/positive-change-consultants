const form = document.querySelector("#appointmentForm");
const message = document.querySelector("#formMessage");
const currentTime = document.querySelector("#currentTime");
const calendarGrid = document.querySelector("#calendarGrid");
const calendarTitle = document.querySelector("#calendarTitle");
const previousMonth = document.querySelector("#previousMonth");
const nextMonth = document.querySelector("#nextMonth");
const appointmentList = document.querySelector("#appointmentList");
const clearAppointments = document.querySelector("#clearAppointments");

const storageKey = "positiveChangeAppointments";
const today = new Date();
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function readAppointments() {
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function saveAppointments(appointments) {
  localStorage.setItem(storageKey, JSON.stringify(appointments));
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateClock() {
  currentTime.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function renderCalendar() {
  const appointments = readAppointments();
  const appointmentCounts = appointments.reduce((counts, item) => {
    counts[item.date] = (counts[item.date] || 0) + 1;
    return counts;
  }, {});

  calendarTitle.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  calendarGrid.innerHTML = "";
  weekdays.forEach((day) => {
    const label = document.createElement("div");
    label.className = "weekday";
    label.textContent = day;
    calendarGrid.append(label);
  });

  const start = new Date(visibleMonth);
  start.setDate(1 - start.getDay());

  for (let index = 0; index < 42; index++) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    const key = formatDateKey(date);
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.textContent = date.getDate();

    if (date.getMonth() !== visibleMonth.getMonth()) cell.classList.add("muted");
    if (key === formatDateKey(today)) cell.classList.add("today");
    if (appointmentCounts[key]) {
      cell.classList.add("booked");
      const badge = document.createElement("span");
      badge.textContent = `${appointmentCounts[key]} request${appointmentCounts[key] > 1 ? "s" : ""}`;
      cell.append(badge);
    }

    calendarGrid.append(cell);
  }
}

function renderAppointments() {
  const appointments = readAppointments().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  if (!appointments.length) {
    appointmentList.innerHTML = '<p class="appointment-item">No appointment requests yet.</p>';
    return;
  }

  appointmentList.innerHTML = appointments
    .map((item) => {
      const date = new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(`${item.date}T00:00:00`));

      return `
        <article class="appointment-item">
          <strong>${item.name}</strong>
          <p>${date} at ${item.time} - ${item.service}</p>
          <p>${item.email} - ${item.phone}</p>
        </article>
      `;
    })
    .join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const appointment = Object.fromEntries(formData.entries());
  const appointments = readAppointments();

  appointments.push({
    ...appointment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });

  saveAppointments(appointments);
  message.textContent = "Appointment request saved and added to the calendar.";
  form.reset();
  renderCalendar();
  renderAppointments();
});

previousMonth.addEventListener("click", () => {
  visibleMonth.setMonth(visibleMonth.getMonth() - 1);
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  visibleMonth.setMonth(visibleMonth.getMonth() + 1);
  renderCalendar();
});

clearAppointments.addEventListener("click", () => {
  saveAppointments([]);
  message.textContent = "Appointment requests cleared.";
  renderCalendar();
  renderAppointments();
});

updateClock();
setInterval(updateClock, 1000);
renderCalendar();
renderAppointments();
