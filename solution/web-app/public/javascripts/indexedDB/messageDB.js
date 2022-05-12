/*
 *  Written by Tong Chen (tchen64@sheffield.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';
//import * as idb from './idb/index.js';


////////////////// DATABASE //////////////////
let db;

// Define the names of databases and object stores
const MSG_DB_NAME= 'db_msg';
const MSG_STORE_NAME= 'store_msg';

// Export to the window namespace
window.MSG_DB_NAME = MSG_DB_NAME;
window.MSG_STORE_NAME = MSG_STORE_NAME;

// the database receives from the server the following structure
const messageData = [
    { roomId: 1, username:'Tong', isSelf: true, msgNum: 1, content: "Hi, I'm Tong.", time:'11:00 am'},//, time, accountId},
    { roomId: 1, username:'Mary',isSelf: false, msgNum: 2, content: "Hi, I'm Mary.", time:'11:01 am'},
    { roomId: 1, username:'Tong',isSelf: true, msgNum: 3, content: "Nice to meet you.", time:'11:02 am'},
    { roomId: 2, username:'Mary',isSelf: true, msgNum: 1, content: "Hello.", time:'11:03 am'}
];

const roomToStoryData = [
    { roomId: 1, storyId: 1},
    { roomId: 2, storyId: 1},
    { roomId: 3, storyId: 9},
    { roomId: 4, storyId: 12}
];

/**
 * it inits the message database and creates an index for the roomId field
 */
async function initMessageDB(){
    if (!db) {
        db = await idb.openDB(MSG_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {

                // Check if there exists message database; if not, create a new database for chat
                if (!upgradeDb.objectStoreNames.contains(MSG_STORE_NAME)) {
                    let msgDB = upgradeDb.createObjectStore(MSG_STORE_NAME, {
                        keyPath: 'id'
                        // autoIncrement: true
                    });
                    msgDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('Message database created');
    }
}
window.initMessageDB= initMessageDB;

/**
 * it saves the message into the database
 * if the database is not supported, it will use localstorage
 * @param msgObject: it contains { roomId, username, isSelf, msgNum, content, time}
 */
async function storeMessage(msgObject) {
    console.log('Inserting item into indexedDB: ' + JSON.stringify(msgObject));
    if (!db)
        await initMessageDB();
    if (db) {
        try{
            let tx = await db.transaction(MSG_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(MSG_STORE_NAME);
            await store.put(msgObject);
            await  tx.complete;
            console.log('Added message to the store: ' + JSON.stringify(msgObject));
        } catch(error) {
            console.log('Error: Could not store the message. Reason: '+error);
        }
    }
    else localStorage.setItem(msgObject.content, JSON.stringify(msgObject));
}
window.storeMessage= storeMessage;

/**
 * it counts all history messages in message database
 * @returns number of messages
 */
async function generateID(){
    if (!db)
        await initMessageDB();
    if (db) {
        let tx = await db.transaction(MSG_STORE_NAME, 'readonly');
        let store = await tx.objectStore(MSG_STORE_NAME);
        let messages = await store.getAll(); // read all history messages in this room

        // get the last id in history in database
        let count = 0;
        for( let msg of messages){
            count++;
            if(count === messages.length){
                return msg.id;
            }
        }

    }
}
window.generateID = generateID;

/**
 * it retrieves all the messages that have sent in the roomNum
 * if the database is not supported, it will use localstorage
 * @param roomNum: a number
 * @returns a list of message items
 */
async function getMessageList(roomNum) {
    let searchResult = []; // return the message list of roomNum
    if (!db)
        await initMessageDB();
    if (db) {
        let tx = await db.transaction(MSG_STORE_NAME, 'readonly');
        let store = await tx.objectStore(MSG_STORE_NAME);
        let index = await store.index('roomId');
        let readingsList = await index.getAll(IDBKeyRange.only(roomNum)); // read all history messages in this room
        console.log('Fetching message list: ' + JSON.stringify(readingsList));
        await tx.complete;

        if (readingsList && readingsList.length > 0) {
            for (let elem of readingsList){
                searchResult.push(elem); // save message in list
            }
        } else {
            // if the database is not supported, use localstorage
            const value = localStorage.getItem(roomNum);
            if (value == null)
                console.log('There are no history in this room.'); // there are nothing in localstorage
            else {
                searchResult.push(value);
            }
        }
    } else {
        const value = localStorage.getItem(roomNum);
        if (value == null)
            console.log('There are no history in this room.'); // there are nothing in localstorage
        else {
            searchResult.push(value);
        }
    }

    return searchResult;
}
window.getMessageList= getMessageList;

/**
 * it counts the number of history messages in roomNum
 * @param roomNum: id of room
 * @returns number of messages
 */
async function getMsgNum(roomNum) {
    if (!db)
        await initMessageDB();
    if (db) {
        let tx = await db.transaction(MSG_STORE_NAME, 'readonly');
        let store = await tx.objectStore(MSG_STORE_NAME);
        let index = await store.index('roomId');


         // count the history messages in this room
        return await index.count(IDBKeyRange.only(roomNum));

    }
}
window.getMsgNum= getMsgNum;

/**
 * it clears history messages in this room
 * if this room will be reused
 * @param roomNum: id of room
 */
async function clearHistory(roomNum) {
    if (!db)
        await initMessageDB();
    if (db) {
        let tx = await db.transaction(MSG_STORE_NAME, 'readwrite');
        let store = await tx.objectStore(MSG_STORE_NAME);
        let index = await store.index('roomId');
        let history = await index.getAll(IDBKeyRange.only(roomNum)); // read all history messages in this room

        // delete the messages according to id
        if (history && history.length > 0) {
            for(let msg of history){
                console.log('deleting !!! msg:', msg);
                await store.delete(msg.id);
            }
        }
    }
}
window.clearHistory= clearHistory;