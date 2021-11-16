// Reference from Week 19 activity 

let db;
// create new connection
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  let objectStore = db.createObjectStore("Pending", {
    keyPath: "id",
    autoIncrement: true,
  });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Sorry", event.target.errorCode);
};

// used in index.js if the POST request for the API fails
function saveRecord(record) {
  const transaction = db.transaction(["Pending"], "readwrite");
  const pendingStore = transaction.objectStore("Pending");
  // add a record to indexDB
  pendingStore.add(record);
}

// checking for internet connection
function checkDatabase() {
  const transaction = db.transaction(["Pending"], "readwrite");
  const pendingStore = transaction.objectStore("Pending");

  const records = pendingStore.getAll();

  records.onsuccess = function () {
    if (records.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(records.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const pendingStore = transaction.objectStore("pending");
          pendingStore.clear();
        });
    }
  };
}
// listen if app coming back online
window.addEventListener("online", checkDatabase);