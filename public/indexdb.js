let budgetdb;

const request = window.indexedDB.open("budget", 1);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
  request.onupgradeneeded = function (event) {
    // create object store called "pending" and set autoIncrement to true
    const db = event.target.result;
    db.createObjectStore("loading", { autoIncrement: true });
  };

  request.onerror = function (event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
const transaction = budgetdb.transaction(["loading"], "readwrite");
const store = transaction.objectStore("loading");
store.add(record);
}
function storeData() {
const transaction = budgetdb.transaction(["loading"], "readwrite");
const store = transaction.objectStore("loading");
const getAll = store.getAll();
getAll.onsuccess= function(){
    if(getAll.result.length > 0) {
        fetch("/api/transaction/bulk",{
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",  
            },
        } 
        ).then((response)=> response.json())
        .then(()=> {
            const transaction = budgetdb.transaction(["loading"], "readwrite");
            const store = transaction.objectStore("loading");   
            store.clear(); 
        })
    }
}
}
request.onsuccess = event => {
    budgetdb = event.target.result
    if (navigator.onLine) {
      storeData();
  }
};
  
  window.addEventListener("online", storeData);