/*
 *  Written by Tong Chen (tchen64@sheffield.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';
//import * as idb from './idb/index.js';


////////////////// DATABASE //////////////////
let k_graph_db;

// Define the names of databases and object stores
const GRAPH_DB_NAME= 'db_graph';
const GRAPH_STORE_NAME= 'store_graph';

// Export to the window namespace
window.GRAPH_DB_NAME = GRAPH_DB_NAME;
window.GRAPH_STORE_NAME = GRAPH_STORE_NAME;

// the database receives from the server the following structure
const kGraphData = [
    { roomId: 1, username:'Tong', kGraphNum: 1, color: "rgb(0,0,0)", row: "{...}"},//, time, accountId},
    { roomId: 1, username:'Mary', kGraphNum: 2, color: "rgb(0,0,0)", row: "{...}"},
    { roomId: 1, username:'Tong', kGraphNum: 3, color: "rgb(0,0,0)", row: "{...}"},
    { roomId: 2, username:'Mary', kGraphNum: 1, color: "rgb(0,0,0)", row: "{...}"}
];


/**
 * it inits the knowledge graph database and creates an index for the roomId field
 */
async function initKGraphDB(){
    if (!k_graph_db) {
        k_graph_db = await idb.openDB(GRAPH_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {

                // Check if there exists message database; if not, create a new database for chat
                if (!upgradeDb.objectStoreNames.contains(GRAPH_STORE_NAME)) {
                    let graphDB = upgradeDb.createObjectStore(GRAPH_STORE_NAME, {
                        // keyPath: 'id',
                        autoIncrement: true
                    });
                    graphDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('Knowledge Graph database created');
    }
}
window.initKGraphDB= initKGraphDB;

/**
 * it saves the knowledge into the database
 * if the database is not supported, it will use localstorage
 * @param roomNo id of room
 * @param name username
 * @param color color of border
 * @param row object of KGraph
 */
async function storeKGraph(roomNo, row, name, color) {
    let addObject = {
        roomId: roomNo,
        username: name,
        kGraphNum: 1,
        color: color,
        row: JSON.stringify(row)
    }

    if (k_graph_db) {
        try{
            let tx = await k_graph_db.transaction(GRAPH_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(GRAPH_STORE_NAME);

            await store.put(addObject);
            await  tx.complete;
            console.log('Added knowledge graph to the store');
        } catch(error) {
            console.log('Error: Could not store the knowledge. Reason: '+error);
        }
    }
    else localStorage.setItem(addObject.content, JSON.stringify(addObject));
}
window.storeKGraph= storeKGraph;

// /**
//  * it saves the message into the database
//  * if the database is not supported, it will use localstorage
//  * @param msgObject: it contains { roomId, username, isSelf, msgNum, content, time}
//  */
// async function storeMessage(msgObject) {
//     console.log('Inserting item into indexedDB: ' + JSON.stringify(msgObject));
//     if (msg_db) {
//         try{
//             let tx = await msg_db.transaction(MSG_STORE_NAME, 'readwrite');
//             let store = await tx.objectStore(MSG_STORE_NAME);
//             await store.put(msgObject);
//             await  tx.complete;
//             console.log('Added message to the store: ' + JSON.stringify(msgObject));
//         } catch(error) {
//             console.log('Error: Could not store the message. Reason: '+error);
//         }
//     }
//     else localStorage.setItem(msgObject.content, JSON.stringify(msgObject));
// }
// window.storeMessage= storeMessage;
//
// /**
//  * it counts all history messages in message database
//  * @returns number of messages
//  */
// async function generateID(){
//     let tx = await msg_db.transaction(MSG_STORE_NAME, 'readonly');
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
//     if (msg_db) {
//         let tx = await msg_db.transaction(MSG_STORE_NAME, 'readonly');
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
//     let tx = await msg_db.transaction(MSG_STORE_NAME, 'readonly');
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
//     console.log('msg_db', msg_db);
//     let tx = await msg_db.transaction(MSG_STORE_NAME, 'readwrite');
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