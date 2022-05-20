/*
 *  Written by Tong Chen (tchen64@sheffield.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';
//import * as idb from './idb/index.js';


////////////////// DATABASE //////////////////
// the database receives from the server the following structure
let db;

// Define the names of databases and object stores
const ROOM_TO_STORY_NAME= 'store_room_to_story';

// Export to the window namespace
window.ROOM_TO_STORY_NAME = ROOM_TO_STORY_NAME;

// Static exist message
const roomToStoryData = [
    { roomId: 1, storyId: 1},
    { roomId: 2, storyId: 1},
    { roomId: 3, storyId: 9},
    { roomId: 4, storyId: 12}
];



/**
 * it gets the story id from database and checks if the story changed
 * @param roomNum: the room number that user require to enter
 * @param newStoryId: the story number that user require to discuss this time
 * @return : boolean: return true if story is changed, return false if story isn't changed
 */
async function checkStoryChange(roomNum, newStoryId){
    let result = await getStoryNumber(roomNum);
    return result !== newStoryId;
}


/**
 * it checks if the user can enter the room now and clear char history according to user choice
 * @param ifEmpty: it means if the room is empty now
 * @param roomNum: the room number that user require to enter
 * @param newStoryId: the story number that user require to discuss this time
 */
async function checkRoomAvailable(ifEmpty, roomNum, newStoryId){
    return await getStoryNumber(roomNum) // get the id of story which is discussing in room
        .then( async result => {
            if (result === -1) {
                await updateRelationship(roomNum, newStoryId);
                return false; // room is new, user can enter
            } else {
                let ifStoryChanged = await checkStoryChange(roomNum, newStoryId);

                if (ifStoryChanged) {
                    // story is changed, clear history of room
                    console.log("Ready to clear history")
                    await clearHistory(roomNum);
                    await clearCanvasDB(roomNum);
                    // update the relationship between room and story
                    await updateRelationship(roomNum, newStoryId);
                    console.log('room already be reused');
                    return false;

                } else {
                    // story is not changed, user can enter and reuse the room
                    console.log('story is not changed, user can enter the room and view history');
                    return true;
                }
            }
        })
}
window.checkRoomAvailable = checkRoomAvailable;

/**
 * it inits the roomToStory database and creates an index for the roomId field
 */
async function initRoomToStoryDB(){
    if (!db) {
        db = await idb.openDB(ROOM_TO_STORY_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {

                // Check if there exists roomToStory database; if not, create a new database
                if (!upgradeDb.objectStoreNames.contains(ROOM_TO_STORY_NAME)) {
                    let roomToStoryDB = upgradeDb.createObjectStore(ROOM_TO_STORY_NAME, {
                        keyPath: 'roomId'
                    });
                    roomToStoryDB.createIndex('roomId', 'roomId', {unique: true, multiEntry: false});
                    roomToStoryDB.createIndex('storyId', 'storyId', {unique: false, multiEntry: false});
                }
            }
        });
        console.log('RoomToStory database created');
    }
}
window.initRoomToStoryDB= initRoomToStoryDB;

/**
 * it saves a new relationship between room and story into the database
 * each room just points to one story
 * if the database is not supported, it will use localstorage
 * @param object
 */
async function storeRelationship(object) {
    if (!db)
        await initRoomToStoryDB();
    if (db) {
        try{
            let tx = await db.transaction(ROOM_TO_STORY_NAME, 'readwrite');
            let store = await tx.objectStore(ROOM_TO_STORY_NAME);
            if (object.storyId !== ''){
                await store.put(object);
                await tx.complete;
                console.log('Added relationship to the store! '+ JSON.stringify(object));
            }
            else {
                console.log('Can\'t add relationship to the store! Missing story id. '+ JSON.stringify(object));
            }
        } catch(error) {
            console.log('Error: I could not store the relationship. Reason: '+error);
        }
    }
    else localStorage.setItem(object.content, JSON.stringify(object));
}
window.storeRelationship= storeRelationship;

/**
 * it retrieves all the room numbers which are discussing the story
 * if the database is not supported, it will use localstorage
 * @param storyNum: id of story
 * @returns data item of story
 */
async function getRoomList(storyNum) {
    let searchResult = []; // return all eligible room numbers
    if (!db)
        await initRoomToStoryDB();
    if (db) {
        let tx = await db.transaction(ROOM_TO_STORY_NAME, 'readonly');
        let store = await tx.objectStore(ROOM_TO_STORY_NAME);
        let index = await store.index('storyId');
        let roomNums = await index.getAll(IDBKeyRange.only(storyNum)); // search rooms
        await tx.complete;

        if (roomNums && roomNums.length > 0) {
            for (let elem of roomNums){
                searchResult.push(elem.roomId); // save room number in list
            }
        } else {
            // if the database is not supported, use localstorage
            const value = localStorage.getItem(storyNum);
            if (value == null)
                console.log('No rooms are talking about this story.'); // there are nothing in localstorage
            else {
                for (let elem of value){
                    searchResult.push(elem.roomId);
                }
            }
        }
    } else {
        const value = localStorage.getItem(storyNum);
        if (value == null)
            console.log('No rooms are talking about this story.'); // there are nothing in localstorage
        else {
            for (let elem of value){
                searchResult.push(elem.roomId);
            }
        }
    }

    return searchResult;
}
window.getRoomList= getRoomList;

/**
 * it gets the story id which are discussing in the room
 * if the database is not supported, it will use localstorage
 * @param roomNum: id of room
 * @returns id of story
 */
async function getStoryNumber(roomNum) {
    if (!db)
        await initRoomToStoryDB();
    if (db) {
        let tx = await db.transaction(ROOM_TO_STORY_NAME, 'readonly');
        let store = await tx.objectStore(ROOM_TO_STORY_NAME);
        let index = await store.index('roomId');
        let story = await index.get(IDBKeyRange.only(roomNum)); // search story
        console.log('Story and room: ' + JSON.stringify(story));
        await tx.complete;

        if (story) {
            return story.storyId;
        } else {
            // if the database is not supported, use localstorage
            const value = localStorage.getItem(roomNum);
            if(value){
                return value.storyId;
            } else {
                console.log('This room is new.'); // there are nothing in localstorage
                return -1;
            }
        }
    }
}
window.getStoryNumber= getStoryNumber;


/**
 * it updates relationship between room and story into the database
 * when a room is reused and change a story to discuss
 * if the database is not supported, it will use localstorage
 * @param roomId: id of room
 * @param storyNum: id of story
 */
async function updateRelationship(roomId, storyNum) {
    if (!db)
        await initRoomToStoryDB();
    if (db) {
        try{
            let tx = await db.transaction(ROOM_TO_STORY_NAME, 'readwrite');
            let store = await tx.objectStore(ROOM_TO_STORY_NAME);
            let request = await store.get(roomId);

            console.log(request);
            await store.put({roomId:roomId, storyId:storyNum}); // insert new item
            console.log('Update relationship!!!!!! ', roomId, storyNum)
            await tx.complete;
        } catch(error) {
            console.log('Error: Can not store the relationship. Reason: '+error);
        }
    }
}
window.updateRelationship= updateRelationship;