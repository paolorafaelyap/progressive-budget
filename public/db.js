"use strict";
const pendingObjectName = `pending`;
const request = indexedDB.open(`budget`, 2);

//new budget database request
request.onupgradeneeded = event => {
    const db = request.result;
    console.log(event);
    if (!db.objectNames.contains(pendingObjectName)) {
        db.createObjectStore(pendingObjectName, { autoIncrement: true });
    }

};

// if app is online, read from db
//success and error handlers
request.onsuccess = event => {
    console.log(`${event.type}`);
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = event => console.error(event);

//function for checking database to be added here
function checkDatabase() {
    const db = request.result;
    // opens transaction for pending db
    let transaction = db.transaction([pendingObjectName], `readwrite`);
    // accesses pending object store
    let store = transaction.objectStore(pendingObjectName);
    // gets all records from object store
    const allRecords = store.allRecords();

    allRecords.onsuccess = () => {
        if(allRecords.result.length > 0) {

            fetch(`/api/transaction/bulk`, {
                method: `POST`,
                body: JSON.stringify(allRecords.result),
                headers: {
                    Accept: `application/json, text/plain, */*`,
                    "Content-Type": `application/json`
                }
            })
            .then(response => response.json())
            .then(() => {
                transaction = db.transaction([pendingObjectName], `readwrite`);
                store = transaction.objectStore(pendingObjectName);
                //this will clear store items
                store.clear();
            });
        }

    };
}

function saveRec(record) {
    const db = request.result;
    const transaction = db.transaction([pendingObjectName], `readwrite`);
    //add method used to add store
    store.add(record);
}

window.addEventListener(`online`, checkDatabase);