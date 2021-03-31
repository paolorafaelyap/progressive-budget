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
request.onsuccess = event => {
    console.log(`${event.type}`);
    if (navigator.onLine) {
        checkDatabase();
    }
}


