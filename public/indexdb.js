let budgetdb;

const request = window.indexedDB.open("budget", 1);
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
request.onupgradeneeded = ({ target }) => {
  budgetdb = target.result;
  const objectStore = budgetdb.createObjectStore("budget", { autoIncrement:true });
  
};
function storeData() {
const transaction = budgetdb.transaction(["budget"], "readwrite");
const store = transaction.objectStore("budget");
store.onsuccess= function(){
    if(store.result.length > 0) {
        fetch("/api/transaction/bulk",{
            method: "POST",
            body: JSON.stringify(store.result),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",  
            },
        } 
        ).then((response)=> response.json())
        .then(()=> {
            const transaction = budgetdb.transaction(["budget"], "readwrite");
            const store = transaction.objectStore("budget");   
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