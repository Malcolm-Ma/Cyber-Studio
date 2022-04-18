/*
 *  Written by Tong Chen (tchen64@sheffield.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';


////////////////// DATABASE //////////////////
// the database receives from the server the following structure
let db;

// Define the names of databases and object stores
const MSG_DB_NAME= 'db_msg';
const MSG_STORE_NAME= 'store_msg';
const STORY_STORE_NAME= 'store_story';
const ROOM_TO_STORY_NAME= 'store_room_to_story';

window.MSG_DB_NAME = MSG_DB_NAME;
window.MSG_STORE_NAME = MSG_STORE_NAME;
window.STORY_STORE_NAME = STORY_STORE_NAME;
window.ROOM_TO_STORY_NAME = ROOM_TO_STORY_NAME;

// Static exist message
const messageData = [
    { roomId: 1, isSelf: true, msgNum: 1, content: "Hi, I'm Tong." },//, time, accountId},
    { roomId: 1, isSelf: false, msgNum: 2, content: "Hi, I'm Mary." },
    { roomId: 1, isSelf: true, msgNum: 3, content: "Nice to meet you." },
    { roomId: 2, isSelf: true, msgNum: 1, content: "Hello." }
];

const roomToStoryData = [
    { roomId: 1, storyId: 1},
    { roomId: 2, storyId: 1},
    { roomId: 3, storyId: 9},
    { roomId: 4, storyId: 12}
];

const storyData = [
    { title: "IceSnow", author: "Tong", description: "It is a happy ending.", photoId: "ascv123jsfgiu"},//, timestamp}
];

// photo_id -- photo base 64
// local story DB-- used when offline
// message database
// 关系表 -- roomId & storyId & empty
// 按照时间确定msgNum

// 生成roomId（ABC123）和accountId（123）每个用户都可以有几个id。每次进入一个room就随机生成一个id。npm.uuid
function randomRoomId(){

}
function randomAccountId(){

}

/**
 * it gets the story id from database and checks if the story changed
 * @param roomNum: the room number that user require to enter
 * @param newStoryId: the story number that user require to discuss this time
 * @return : boolean
 */
function checkStoryChange(roomNum, newStoryId){
    // oldStoryId = getStoryId
    return true;
}

// check room
// story变了 & 有人 -》不能进；story没变 & 有人 -》 加入房间； story变了 & 没人 -》 进房间且选择清记录，改变story关系；story没变 & 没人 -》 进房间
/**
 * it checks if the user can enter the room now and clear char history according to user choice
 * @param ifEmpty: it means if the room is empty now
 * @param roomNum: the room number that user require to enter
 * @param newStoryId: the story number that user require to discuss this time
 */
async function checkRoomAvailable(ifEmpty, roomNum, newStoryId){
    let ifStoryChange = checkStoryChange(roomNum, newStoryId);
    if(ifEmpty && ifStoryChange){
        //story变了 & 没人 -》 进房间且选择清记录，改变story关系
        // 1. get old story from roomToStory database
        // 2. judge if story change
        // 3. delete/not delete
        // deleteMessage(roomNum);
        // 4. change relation in roomToStory
        // updateRoomToStory(roomNum, newStoryId);
        return true;
    } else if(!ifEmpty && ifStoryChange){
        //story变了 & 有人 -》不能进
        return false;
    } else if(ifEmpty && !ifStoryChange){
        //story没变 & 没人 -》 进房间
        return true;
    } else if(!ifEmpty && !ifStoryChange){
        //story没变 & 有人 -》 加入房间
        return true;
    }
}

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
                        //keyPath: 'roomId',
                        autoIncrement: true
                    });
                    msgDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }

                // Check if there exists story database; if not, create a new database for story
                if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
                    let storyDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {
                        keyPath: 'photo_id',
                        autoIncrement: true
                    });
                }
            }
        });
        console.log('Database created');
    }
}
window.initMessageDB= initMessageDB;

/**
 * it saves the message into the database
 * if the database is not supported, it will use localstorage
 * @param msgObject: it contains { roomId, isSelf, msgNum, content }
 */
async function storeMessage(msgObject) {
    console.log('inserting: '+JSON.stringify(msgObject));
    if (!db)
        await initMessageDB();
    if (db) {
        try{
            let tx = await db.transaction(MSG_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(MSG_STORE_NAME);
            await store.put(msgObject);
            await  tx.complete;
            console.log('added item to the store! '+ JSON.stringify(msgObject));
        } catch(error) {
            console.log('error: I could not store the element. Reason: '+error);
        }
    }
    else localStorage.setItem(msgObject.content, JSON.stringify(msgObject));
}
window.storeMessage= storeMessage;

/**
 * it retrieves all the messages that have sent in the roomNum
 * if the database is not supported, it will use localstorage
 * @param roomNum: a number
 * @returns objects like { roomId, isSelf, msgNum, content }
 */
async function getMessage(roomNum) {
    let searchResult = []; // return the message list of roomNum
    if (!db)
        await initMessageDB();
    if (db) {
        console.log('fetching: ' + roomNum);
        let tx = await db.transaction(MSG_STORE_NAME, 'readonly');
        let store = await tx.objectStore(MSG_STORE_NAME);
        let index = await store.index('roomId');
        let readingsList = await index.getAll(IDBKeyRange.only(roomNum));
        console.log('list: ' + JSON.stringify(readingsList));
        await tx.complete;

        if (readingsList && readingsList.length > 0) {
            for (let elem of readingsList){
                showMessage(elem);
                searchResult.push(elem);
            }
        } else {
            // if the database is not supported, we use localstorage
            const value = localStorage.getItem(roomNum);
            if (value == null)
                showMessage(); // there are nothing in localstorage
            else {
                showMessage(value);
                searchResult.push(value);
            }
        }
    } else {
        const value = localStorage.getItem(roomNum);
        if (value == null)
            showMessage();
        else {
            showMessage(value);
            searchResult.push(value);
        }
    }

    return searchResult;
}
window.getMessage= getMessage;

/**
 * it saves the item into the corresponding
 * if the database is not supported, it will use localstorage
 * @param itemObject: it's the added item object
 * @param storeName: it means item will be added into which object store
 */
async function storeItem(itemObject, storeName) {
    console.log('inserting: '+JSON.stringify(itemObject));
    if (!db)
        await initMessageDB();
    if (db) {
        try{
            let tx = await db.transaction(storeName, 'readwrite');
            let store = await tx.objectStore(storeName);
            await store.put(itemObject);
            await  tx.complete;
            console.log('added to the ' + storeName + ' successfully ! '+ JSON.stringify(itemObject));
        } catch(error) {
            console.log('error: the item could not store into the ' + storeName + '. Reason: ' + error);
        }
    }
    else localStorage.setItem(itemObject.content, JSON.stringify(itemObject));
}
window.storeItem= storeItem;

/**
 * it retrieves all the messages that have sent in the roomNum
 * if the database is not supported, it will use localstorage
 * @param roomNum: a number
 * @param newStoryId: a number
 */
async function updateRoomToStory(roomNum, newStoryId) {
    if (!db)
        await initMessageDB();
    if (db) {
        let tx = await db.transaction(ROOM_TO_STORY_NAME, 'readwrite');
        let store = await tx.objectStore(ROOM_TO_STORY_NAME);
        let index = await store.index('roomId');
        let readingsList = await index.getAll(IDBKeyRange.only(roomNum));
        console.log('list: ' + JSON.stringify(readingsList));
        await tx.complete;

        if (readingsList) {
            //change story
        } else {
            // if the database is not supported, we use localstorage
            const value = localStorage.getItem(roomNum);
            if (value == null)
                console.log('Error to change story. The ' + roomNum + ' room is not exist.')
            else {
                //change story
            }
        }
    } else {
        // if the database is not supported, we use localstorage
        const value = localStorage.getItem(roomNum);
        if (value == null)
            console.log('Error to change story. The ' + roomNum + ' room is not exist.')
        else {
            //change story
        }
    }
}
window.updateRoomToStory= updateRoomToStory;

/**
 * it retrieves all the messages that have sent in the roomNum
 * if the database is not supported, it will use localstorage
 * @param roomNum: a number
 * @returns objects like { roomId, isSelf, msgNum, content }
 */
async function deleteMessage(roomNum) {
    if (!db)
        await initMessageDB();
    if (db) {
        console.log('deleting messages of room ' + roomNum);
        let tx = await db.transaction(MSG_STORE_NAME, 'readwrite');
        let store = await tx.objectStore(MSG_STORE_NAME);
        let index = await store.index('roomId');
        let readingsList = await index.getAll(IDBKeyRange.only(roomNum));
        console.log('list: ' + JSON.stringify(readingsList));
        await tx.complete;

        if (readingsList && readingsList.length > 0) {
            for (let elem of readingsList){
                //delete all messages
            }
        } else {
            // if the database is not supported, we use localstorage
            const value = localStorage.getItem(roomNum);
            if (value != null) {
                //delete all messages
            }
        }
    } else {
        // if the database is not supported, we use localstorage
        const value = localStorage.getItem(roomNum);
        if (value != null) {
            //delete all messages
        }
    }
}
window.deleteMessage= deleteMessage;


