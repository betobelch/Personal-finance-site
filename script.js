import { Chart } from "@/components/ui/chart"
// Data Storage
let data = {
  income: [],
  fixedExpenses: [],
  variableExpenses: [],
}

let currentModalType = ""
const currentCalendarDate = new Date()

// Charts
let expensesChart = null
let monthlyChart = null

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadData()
  initializeTabs()
  updateCurrentMonth()
  renderAllLists()
  renderCalendar()
  initializeCharts()
  updateSummary()
})

// Load data from localStorage
function loadData() {
  const savedData = localStorage.getItem("financeData")
  if (savedData) {
    data = JSON.parse(savedData)
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("financeData", JSON.stringify(data))
}

// Update current month display
function updateCurrentMonth() {
  const now = new Date()
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]
  document.getElementById("currentMonth").textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`
}

// Tab Navigation
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab")

      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      button.classList.add("active")
      document.getElementById(targetTab).classList.add("active")
    })
  })
}

// Modal Functions
function openModal(type) {
  currentModalType = type
  const modal = document.getElementById("modal")
  const modalTitle = document.getElementById("modalTitle")

  const titles = {
    renda: "Adicionar Renda",
    "gastos-fixos": "Adicionar Gasto Fixo",
    "gastos-variaveis": "Adicionar Gasto Variável",
  }

  modalTitle.textContent = titles[type]
  modal.classList.add("active")

  // Set default date to today
  document.getElementById("itemDate").valueAsDate = new Date()
}

function closeModal() {
  const modal = document.getElementById("modal")
  modal.classList.remove("active")
  document.getElementById("itemForm").reset()
}

// Form Submit
document.getElementById("itemForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const name = document.getElementById("itemName").value
  const amount = Number.parseFloat(document.getElementById("itemAmount").value)
  const date = document.getElementById("itemDate").value

  const item = {
    id: Date.now(),
    name,
    amount,
    date,
  }

  if (currentModalType === "renda") {
    data.income.push(item)
  } else if (currentModalType === "gastos-fixos") {
    data.fixedExpenses.push(item)
  } else if (currentModalType === "gastos-variaveis") {
    data.variableExpenses.push(item)
  }

  saveData()
  renderAllLists()
  updateSummary()
  updateCharts()
  renderCalendar()
  closeModal()
})

// Render Lists
function renderAllLists() {
  renderList("income", "incomeList", true)
  renderList("fixedExpenses", "fixedList", false)
  renderList("variableExpenses", "variableList", false)
}

function renderList(dataKey, elementId, isIncome) {
  const list = document.getElementById(elementId)
  list.innerHTML = ""

  if (data[dataKey].length === 0) {
    list.innerHTML = '<p style="color: #888888; text-align: center; padding: 2rem;">Nenhum item adicionado ainda.</p>'
    return
  }

  data[dataKey].forEach((item) => {
    const itemDiv = document.createElement("div")
    itemDiv.className = "item"

    const date = new Date(item.date + "T00:00:00")
    const formattedDate = date.toLocaleDateString("pt-BR")

    itemDiv.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-date">${formattedDate}</div>
            </div>
            <div class="item-amount ${isIncome ? "positive" : "negative"}">
                ${isIncome ? "+" : "-"} R$ ${item.amount.toFixed(2)}
            </div>
            <button class="btn-delete" onclick="deleteItem('${dataKey}', ${item.id})">Excluir</button>
        `

    list.appendChild(itemDiv)
  })
}

// Delete Item
function deleteItem(dataKey, itemId) {
  data[dataKey] = data[dataKey].filter((item) => item.id !== itemId)
  saveData()
  renderAllLists()
  updateSummary()
  updateCharts()
  renderCalendar()
}

// Update Summary
function updateSummary() {
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0)
  const totalFixed = data.fixedExpenses.reduce((sum, item) => sum + item.amount, 0)
  const totalVariable = data.variableExpenses.reduce((sum, item) => sum + item.amount, 0)
  const balance = totalIncome - totalFixed - totalVariable

  document.getElementById("totalIncome").textContent = `R$ ${totalIncome.toFixed(2)}`
  document.getElementById("totalFixed").textContent = `R$ ${totalFixed.toFixed(2)}`
  document.getElementById("totalVariable").textContent = `R$ ${totalVariable.toFixed(2)}`

  const balanceElement = document.getElementById("balance")
  balanceElement.textContent = `R$ ${balance.toFixed(2)}`
  balanceElement.className = "amount " + (balance >= 0 ? "positive" : "negative")
}

// Initialize Charts
function initializeCharts() {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
      },
    },
  }

  // Expenses Pie Chart
  const expensesCtx = document.getElementById("expensesChart").getContext("2d")
  expensesChart = new Chart(expensesCtx, {
    type: "doughnut",
    data: {
      labels: ["Gastos Fixos", "Gastos Variáveis"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["#f44336", "#ff9800"],
          borderColor: "#000000",
          borderWidth: 2,
        },
      ],
    },
    options: chartOptions,
  })

  // Monthly Line Chart
  const monthlyCtx = document.getElementById("monthlyChart").getContext("2d")
  monthlyChart = new Chart(monthlyCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
      datasets: [
        {
          label: "Renda",
          data: [0, 0, 0, 0, 0, 0],
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          tension: 0.4,
        },
        {
          label: "Gastos",
          data: [0, 0, 0, 0, 0, 0],
          borderColor: "#f44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#888888",
          },
          grid: {
            color: "#1a1a1a",
          },
        },
        x: {
          ticks: {
            color: "#888888",
          },
          grid: {
            color: "#1a1a1a",
          },
        },
      },
    },
  })

  updateCharts()
}

// Update Charts
function updateCharts() {
  const totalFixed = data.fixedExpenses.reduce((sum, item) => sum + item.amount, 0)
  const totalVariable = data.variableExpenses.reduce((sum, item) => sum + item.amount, 0)

  expensesChart.data.datasets[0].data = [totalFixed, totalVariable]
  expensesChart.update()

  // For monthly chart, we'll use current month data
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = totalFixed + totalVariable

  monthlyChart.data.datasets[0].data = [0, 0, 0, 0, 0, totalIncome]
  monthlyChart.data.datasets[1].data = [0, 0, 0, 0, 0, totalExpenses]
  monthlyChart.update()
}

// Calendar Functions
function renderCalendar() {
  const calendar = document.getElementById("calendar")
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  document.getElementById("calendarMonth").textContent =
    `${monthNames[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()}`

  calendar.innerHTML = ""

  // Add day headers
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  dayNames.forEach((day) => {
    const dayHeader = document.createElement("div")
    dayHeader.className = "calendar-day header"
    dayHeader.textContent = day
    calendar.appendChild(dayHeader)
  })

  // Get first day of month and number of days
  const year = currentCalendarDate.getFullYear()
  const month = currentCalendarDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Add previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayDiv = document.createElement("div")
    dayDiv.className = "calendar-day other-month"
    dayDiv.innerHTML = `<div class="day-number">${daysInPrevMonth - i}</div>`
    calendar.appendChild(dayDiv)
  }

  // Add current month days
  const today = new Date()
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div")
    dayDiv.className = "calendar-day"

    const currentDate = new Date(year, month, day)
    const dateString = currentDate.toISOString().split("T")[0]

    if (today.toDateString() === currentDate.toDateString()) {
      dayDiv.classList.add("today")
    }

    const eventsDiv = document.createElement("div")
    eventsDiv.className = "day-events"

    // Add income events
    data.income.forEach((item) => {
      if (item.date === dateString) {
        const eventDiv = document.createElement("div")
        eventDiv.className = "day-event income"
        eventDiv.textContent = `+ ${item.name}`
        eventsDiv.appendChild(eventDiv)
      }
    })

    // Add expense events
    ;[...data.fixedExpenses, ...data.variableExpenses].forEach((item) => {
      if (item.date === dateString) {
        const eventDiv = document.createElement("div")
        eventDiv.className = "day-event expense"
        eventDiv.textContent = `- ${item.name}`
        eventsDiv.appendChild(eventDiv)
      }
    })

    dayDiv.innerHTML = `<div class="day-number">${day}</div>`
    dayDiv.appendChild(eventsDiv)
    calendar.appendChild(dayDiv)
  }

  // Add next month days
  const totalCells = calendar.children.length - 7 // Subtract headers
  const remainingCells = 42 - totalCells - 7 // 6 rows * 7 days - current cells - headers
  for (let day = 1; day <= remainingCells; day++) {
    const dayDiv = document.createElement("div")
    dayDiv.className = "calendar-day other-month"
    dayDiv.innerHTML = `<div class="day-number">${day}</div>`
    calendar.appendChild(dayDiv)
  }
}

function changeMonth(direction) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction)
  renderCalendar()
}

// Close modal when clicking outside
document.getElementById("modal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal()
  }
})
