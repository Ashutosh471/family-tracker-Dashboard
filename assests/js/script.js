console.log("✅ Script loaded successfully!");

document.addEventListener("DOMContentLoaded", function () {
  // 🔹 Inputs
  const amountInput = document.getElementById("expense-amount");
  const categoryInput = document.getElementById("expense-category");
  const dateInput = document.getElementById("expense-date");
  const addBtn = document.getElementById("add-btn");
  const expenseList = document.getElementById("expense-list");
  const totalDisplay = document.getElementById("total");

  // 🔹 Local Storage Data
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  // ---------- CATEGORY ICONS ----------
  const categoryIcons = {
    Food: "🍕", Travel: "✈️", Bills: "💡", Shopping: "🛍️",
    Education: "🎓", Entertainment: "🎬", Health: "💊", Groceries: "🛒",
    Rent: "🏠", Utilities: "🚿", Insurance: "🧾", Savings: "💰",
    Transport: "🚗", Maintenance: "🔧", Clothing: "👕", Gifts: "🎁",
    Charity: "❤️", Others: "📦"
  };

  // ---------- RENDER EXPENSE LIST ----------
  function renderExpenses() {
    expenseList.innerHTML = "";
    let total = 0;

    expenses.forEach((expense, index) => {
      total += expense.amount;

      const categoryClass = expense.category ? expense.category.toLowerCase() : "others";

      const li = document.createElement("li");
      li.innerHTML = `
        <span>
          <span class="expense-category-tag ${categoryClass}">
            ${categoryIcons[expense.category] || "📦"} ${expense.category}
          </span>
          <small style="color:#ccc; font-size:12px; margin-left:5px;">
            (${new Date(expense.date).toLocaleDateString()})
          </small>
        </span>
        <span class="expense-amount">₹${expense.amount.toFixed(2)}
          <button class="delete" onclick="deleteExpense(${index})">❌</button>
        </span>
      `;
      expenseList.appendChild(li);
    });

    totalDisplay.textContent = total.toFixed(2);
    updateCharts();
    updateSavings(); // refresh monthly overview after expense changes

  }

  // ---------- ADD EXPENSE ----------
  function addExpense() {
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!amount || !category || !date) {
      alert("⚠️ Please fill all fields (Category, Amount, and Date).");
      return;
    }

    const newExpense = {
      amount,
      category,
      date: new Date(date).toISOString()
    };

    expenses.push(newExpense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();

    // Clear inputs
    amountInput.value = "";
    categoryInput.value = "";
    dateInput.value = "";
  }

  // ---------- DELETE EXPENSE ----------
  window.deleteExpense = function (index) {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
  };

  // ---------- UPDATE CHARTS ----------
  function updateCharts() {
    updateCategoryChart();
    updateHalfYearChart();
    updateMonthlyChart();
  }

  // ---------- CATEGORY-WISE PIE CHART ----------
  function updateCategoryChart() {
    const ctx = document.getElementById("categoryChart").getContext("2d");
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    if (window.categoryChart) window.categoryChart.destroy();

    window.categoryChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            "rgba(99, 102, 241, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(168, 85, 247, 0.8)"
          ],
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#fff", font: { size: 14 } } }
        },
        animation: { animateScale: true, animateRotate: true }
      }
    });
  }

  // ---------- HALF-YEAR BAR CHART ----------
  function updateHalfYearChart() {
    const ctx = document.getElementById("halfYearChart").getContext("2d");
    let half1 = 0, half2 = 0;
    expenses.forEach((e) => {
      const month = new Date(e.date).getMonth() + 1;
      if (month >= 1 && month <= 6) half1 += e.amount;
      else half2 += e.amount;
    });

    if (window.halfYearChart) window.halfYearChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(99,102,241,0.9)");
    gradient.addColorStop(1, "rgba(139,92,246,0.6)");

    window.halfYearChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Jan - Jun", "Jul - Dec"],
        datasets: [{
          label: "Half-Yearly Spending (₹)",
          data: [half1, half2],
          backgroundColor: gradient,
          borderRadius: 10,
          borderColor: "rgba(255,255,255,0.8)",
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 300000,
            ticks: { color: "#fff", callback: (value) => "₹" + value },
            grid: { color: "rgba(255,255,255,0.2)" }
          },
          x: {
            ticks: { color: "#fff" },
            grid: { color: "rgba(255,255,255,0.1)" }
          }
        },
        plugins: { legend: { labels: { color: "#fff" } } },
        animation: { duration: 2000, easing: "easeOutBounce" }
      }
    });
  }

  // ---------- MONTHLY LINE CHART ----------
  function updateMonthlyChart() {
    const ctx = document.getElementById("monthlyChart").getContext("2d");
    const monthlyTotals = Array(12).fill(0);
    expenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth();
      monthlyTotals[month] += parseFloat(exp.amount);
    });

    if (window.monthlyChart) window.monthlyChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(99,102,241,0.6)");
    gradient.addColorStop(1, "rgba(16,185,129,0.3)");

    window.monthlyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: "Monthly Spending (₹)",
          data: monthlyTotals,
          fill: true,
          borderColor: "#A78BFA",
          backgroundColor: gradient,
          tension: 0.4,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 60000,
            ticks: { color: "#fff", callback: (value) => "₹" + value },
            grid: { color: "rgba(255,255,255,0.2)" }
          },
          x: {
            ticks: { color: "#fff" },
            grid: { color: "rgba(255,255,255,0.1)" }
          }
        },
        plugins: { legend: { labels: { color: "#fff" } } },
        animation: { duration: 2000, easing: "easeInOutQuart" }
      }
    });
  }

  // ✅ Initialize
  addBtn.addEventListener("click", addExpense);
  renderExpenses();
});
