console.log("✅ Script loaded successfully!");

// ===== GLOBAL STATE =====
let expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
let members = JSON.parse(localStorage.getItem("members") || "[]");
let income = parseFloat(localStorage.getItem("income") || "0");
let salaried = parseInt(localStorage.getItem("salaried") || "0");

// ===== ELEMENTS =====
const incomeInput = document.getElementById("incomeInput");
const addMember = document.getElementById("addMember");
const membersDiv = document.getElementById("members");
const generateAIPlan = document.getElementById("generateAIPlan");
const aiAdvice = document.getElementById("aiAdvice");

const sumBalance = document.getElementById("sumBalance");
const sumIncome = document.getElementById("sumIncome");
const sumExpenses = document.getElementById("sumExpenses");
const sumSavings = document.getElementById("sumSavings");

// ===== HELPERS =====
function saveAll() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("members", JSON.stringify(members));
  localStorage.setItem("income", income);
  localStorage.setItem("salaried", salaried);
}

function money(n) {
  return "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// ===== FAMILY MEMBERS =====
function renderMembers() {
  membersDiv.innerHTML = "";
  members.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = "member-row";
    div.innerHTML = `
      <input type="text" placeholder="Name" value="${m.name || ""}" data-i="${i}" data-k="name">
      <input type="number" placeholder="Age" value="${m.age || ""}" data-i="${i}" data-k="age">
      <button data-del="${i}" class="del-btn">✖</button>
    `;
    membersDiv.appendChild(div);
  });
  checkButtons();
}

membersDiv.addEventListener("input", (e) => {
  const i = e.target.dataset.i;
  const k = e.target.dataset.k;
  if (i !== undefined) {
    members[i][k] =
      k === "age" ? parseInt(e.target.value || "0") : e.target.value;
    saveAll();
    checkButtons();
  }
});

membersDiv.addEventListener("click", (e) => {
  const del = e.target.dataset.del;
  if (del !== undefined) {
    members.splice(parseInt(del), 1);
    saveAll();
    renderMembers();
  }
});

addMember.onclick = () => {
  members.push({ name: "", age: 0 });
  saveAll();
  renderMembers();
};

// ===== INCOME + AUTO SAVINGS (10%) =====
function updateSavings() {
  const savings = income * 0.10;
  const remaining = Math.max(income - savings, 0);
  sumIncome.textContent = money(income);
  sumSavings.textContent = money(savings);
  sumBalance.textContent = money(remaining);
  const totalExp = expenses.reduce((a, b) => a + (b.amount || 0), 0);
  sumExpenses.textContent = money(totalExp);
}

incomeInput?.addEventListener("input", checkButtons);

function checkButtons() {
  addMember.disabled = !income;
  generateAIPlan.disabled = !(income && members.some((m) => m.age > 0));
}

// ===== AI BACKEND CALL =====
generateAIPlan.onclick = async () => {
  income = parseFloat(incomeInput.value || 0);
  if (!income) return alert("Enter monthly income first!");

  const ageInputs = membersDiv.querySelectorAll("input[type='number']");
  members = Array.from(ageInputs).map((i) => ({ age: parseInt(i.value || 0) }));
  saveAll();
  updateSavings();

  const totalExpenses = expenses.reduce((a, b) => a + (b.amount || 0), 0);

  aiAdvice.textContent = "⏳ Generating personalized AI financial advice...";
  try {
    const familyData = {
      income,
      salaried,
      members,
      totalExpenses
    };

    const res = await fetch("http://localhost:3000/api/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(familyData)
    });

    const data = await res.json();
    if (data.reply) {
      aiAdvice.innerHTML = "🤖 " + data.reply.replace(/\n/g, "<br>");
    } else {
      aiAdvice.textContent = "⚠️ AI didn’t return a proper response.";
    }
  } catch (err) {
    console.error("❌ AI fetch error:", err);
    aiAdvice.textContent =
      "❌ Failed to get advice from AI. Is your backend running?";
  }
};

// ===== INIT =====
function init() {
  renderMembers();
  updateSavings();
  if (incomeInput) incomeInput.value = income || "";
  checkButtons();
  console.log("✅ Family AI Budget script initialized");
}
document.addEventListener("DOMContentLoaded", init);

// ======== OPTIONAL: GET AI ADVICE BUTTON ========
const getAdviceBtn = document.getElementById("getAdviceBtn");
const adviceOutput = document.getElementById("adviceOutput");

if (getAdviceBtn) {
  getAdviceBtn.addEventListener("click", async () => {
    adviceOutput.textContent = "💭 Thinking... please wait.";

    try {
      const familyData = {
        income: parseFloat(localStorage.getItem("income")) || 0,
        salaried: parseInt(localStorage.getItem("salaried")) || 0,
        members: JSON.parse(localStorage.getItem("members") || "[]")
      };

      const response = await fetch("https://family-ai-tracker.onrender.com/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income, members, totalExpenses }),
      });
      
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      if (data.reply) {
        adviceOutput.innerHTML = "🤖 " + data.reply.replace(/\n/g, "<br>");
      } else {
        adviceOutput.textContent = "⚠️ AI didn’t return a proper response.";
      }
    } catch (err) {
      console.error("❌ AI fetch error:", err);
      adviceOutput.textContent =
        "❌ Failed to get advice from AI. Make sure backend is running.";
    }
  });
}
