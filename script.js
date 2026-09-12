let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
let debts = JSON.parse(localStorage.getItem("debts") || "[]");
let budgets = JSON.parse(
  localStorage.getItem("budgets") ||
    '{"Bike/Fuel":10000,"Food":10000,"Groceries":8000,"Bills":5000}',
);
function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("debts", JSON.stringify(debts));
  localStorage.setItem("budgets", JSON.stringify(budgets));
  render();
}
function addTransaction() {
  let x = {
    id: Date.now(),
    type: type.value,
    amount: +amount.value,
    category: category.value,
    comment: comment.value,
    date: new Date().toISOString(),
  };
  if (x.amount) {
    transactions.unshift(x);
    save();
  }
}
function addDebt() {
  debts.push({
    type: debtType.value,
    person: person.value,
    amount: +debtAmount.value,
    note: debtNote.value,
  });
  save();
}
function render() {
  let b = 0,
    s = {};
  transactions.forEach((t) => {
    b += t.type == "income" ? t.amount : -t.amount;
    if (t.type == "expense") s[t.category] = (s[t.category] || 0) + t.amount;
  });
  balance.innerHTML = b.toLocaleString();
  budgets.innerHTML = Object.keys(budgets)
    .map((c) => {
      let u = s[c] || 0;
      return (
        c +
        ": " +
        u +
        "/" +
        budgets[c] +
        '<div class="progress"><div class="bar" style="width:' +
        Math.min(100, (u / budgets[c]) * 100) +
        '%"></div></div>'
      );
    })
    .join("");
  report.innerHTML =
    Object.keys(s)
      .filter((x) => s[x] > 0)
      .map((x) => x + ": " + s[x])
      .join("<br>") || "No spending";
  transactions.innerHTML = transactions
    .map(
      (t) =>
        '<div class="item"><b class="' +
        t.type +
        '">' +
        (t.type == "income" ? "+" : "-") +
        t.amount +
        "</b><br>" +
        t.category +
        " " +
        t.comment +
        "<br>" +
        new Date(t.date).toLocaleString() +
        "</div>",
    )
    .join("");
  debts.innerHTML = debts
    .map((d) => d.person + " : " + d.amount + " (" + d.type + ")")
    .join("<br>");
}
render();
