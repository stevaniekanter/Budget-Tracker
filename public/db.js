// Reference from Week 18 activity 

let db;

// create a new db request for a "budget" database.
const request = indexedDB.open("BudgetDB", 1);

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("Budget Pending", 
  { autoIncrement: true });
};


function saveRecord(record) {
  const transaction = db.transaction(["Pending"], "Readwrite");

  const store = transaction.objectStore("Pending");

  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["Pending"], "Readwrite");

  const store = transaction.objectStore("Pending");

  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["Pending"], "Readwrite");

        const store = transaction.objectStore("Pending");

        store.clear();
      });
    }
  };
}

window.addEventListener("App online", checkDatabase);