/*
 *  Written by Tong Chen (tchen64@sheffield.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';
//import * as idb from './idb/index.js';


////////////////// DATABASE //////////////////
let canvas_db;

// Define the names of databases and object stores
const CANVAS_DB_NAME= 'db_canvas';
const CANVAS_STORE_NAME= 'store_canvas';

// Export to the window namespace
window.CANVAS_DB_NAME = CANVAS_DB_NAME;
window.CANVAS_STORE_NAME = CANVAS_STORE_NAME;

// the database receives from the server the following structure
const canvasData = [
    { roomId: 1, username:'Tong', drawNum: 1, drawObject: "o"},
    { roomId: 1, username:'Mary', drawNum: 2, drawObject: "o"},
    { roomId: 1, username:'Tong', drawNum: 3, drawObject: "o"},
    { roomId: 2, username:'Mary', drawNum: 1, drawObject: "o"}
];


/**
 * it inits the canvas database and creates an index for the roomId field
 */
async function initCanvasDB(){
    if (!canvas_db) {
        canvas_db = await idb.openDB(CANVAS_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {

                // Check if there exists canvas database; if not, create a new database for canvas
                if (!upgradeDb.objectStoreNames.contains(CANVAS_STORE_NAME)) {
                    let canvasDB = upgradeDb.createObjectStore(CANVAS_STORE_NAME, {
                        keyPath: 'id'
                        // autoIncrement: true
                    });
                    canvasDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('Canvas database created');
    }
}
window.initCanvasDB = initCanvasDB;

/**
 * it saves the draws into the database
 * if the database is not supported, it will use localstorage
 * @param drawObject: it contains { roomId, username, isSelf, msgNum, content, time}
 */
async function storeCanvas(drawObject) {
    console.log('Inserting draw into indexedDB: ' + JSON.stringify(drawObject));
    if (canvas_db) {
        try{
            let tx = await canvas_db.transaction(CANVAS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CANVAS_STORE_NAME);
            await store.put(drawObject);
            await  tx.complete;
            console.log('Added message to the store: ' + JSON.stringify(drawObject));
        } catch(error) {
            console.log('Error: Could not store the draws. Reason: '+error);
        }
    }
    else localStorage.setItem(drawObject.drawObject, JSON.stringify(drawObject));
}
window.storeCanvas= storeCanvas;
//
// /**
//  * it counts all history messages in message database
//  * @returns number of messages
//  */
// async function generateID(){
//     let tx = await db.transaction(MSG_STORE_NAME, 'readonly');
//     let store = await tx.objectStore(MSG_STORE_NAME);
//     let messages = await store.getAll(); // read all history messages in this room
//
//     // get the last id in history in database
//     let count = 0;
//     console.log('msg length', messages.length);
//     if(messages.length === 0){
//         return 0;
//     } else {
//         for( let msg of messages){
//             count++;
//             console.log('Count: ',count);
//             if(count === messages.length){
//                 console.log('Detect id:', msg.id);
//                 return msg.id;
//             }
//         }
//     }
// }
// window.generateID = generateID;
//
// /**
//  * it retrieves all the messages that have sent in the roomNum
//  * if the database is not supported, it will use localstorage
//  * @param roomNum: a number
//  * @returns a list of message items
//  */
// async function getMessageList(roomNum) {
//     let searchResult = []; // return the message list of roomNum
//     if (db) {
//         let tx = await db.transaction(MSG_STORE_NAME, 'readonly');
//         let store = await tx.objectStore(MSG_STORE_NAME);
//         let index = await store.index('roomId');
//         let readingsList = await index.getAll(IDBKeyRange.only(roomNum)); // read all history messages in this room
//         console.log('Fetching message list: ' + JSON.stringify(readingsList));
//         await tx.complete;
//
//         if (readingsList && readingsList.length > 0) {
//             for (let elem of readingsList){
//                 searchResult.push(elem); // save message in list
//             }
//         } else {
//             // if the database is not supported, use localstorage
//             const value = localStorage.getItem(roomNum);
//             if (value == null)
//                 console.log('There are no history in this room.'); // there are nothing in localstorage
//             else {
//                 searchResult.push(value);
//             }
//         }
//     } else {
//         const value = localStorage.getItem(roomNum);
//         if (value == null)
//             console.log('There are no history in this room.'); // there are nothing in localstorage
//         else {
//             searchResult.push(value);
//         }
//     }
//
//     return searchResult;
// }
// window.getMessageList= getMessageList;
//
// /**
//  * it counts the number of history messages in roomNum
//  * @param roomNum: id of room
//  * @returns number of messages
//  */
// async function getMsgNum(roomNum) {
//     let tx = await db.transaction(MSG_STORE_NAME, 'readonly');
//     let store = await tx.objectStore(MSG_STORE_NAME);
//     let index = await store.index('roomId');
//
//     // count the history messages in this room
//     return await index.count(IDBKeyRange.only(roomNum));
// }
// window.getMsgNum= getMsgNum;
//
// /**
//  * it clears history messages in this room
//  * if this room will be reused
//  * @param roomNum: id of room
//  */
// async function clearHistory(roomNum) {
//     let tx = await db.transaction(MSG_STORE_NAME, 'readwrite');
//     let store = await tx.objectStore(MSG_STORE_NAME);
//     let index = await store.index('roomId');
//     let history = await index.getAll(IDBKeyRange.only(roomNum)); // read all history messages in this room
//
//     // delete the messages according to id
//     if (history && history.length > 0) {
//         for(let msg of history){
//             console.log('deleting !!! msg:', msg);
//             await store.delete(msg.id);
//         }
//     }
// }
// window.clearHistory= clearHistory;