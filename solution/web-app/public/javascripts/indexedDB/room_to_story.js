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
 * @return : boolean
 */
function checkStoryChange(roomNum, newStoryId){
    getStoryNumber(roomNum)
        .then( result => {
            if(result === newStoryId) {
                return true;
            } else {
                return false;
            }
        })
        .catch( error => console.log('Error: ' + error))
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
    await updateRelationship(roomNum, newStoryId);
    await clearHistory(roomNum);
    //let ifStoryChange = checkStoryChange(roomNum, newStoryId);
    /*
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
    }*/
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
    console.log('inserting: '+JSON.stringify(object));
    if (!db)
        await initRoomToStoryDB();
    if (db) {
        try{
            let tx = await db.transaction(ROOM_TO_STORY_NAME, 'readwrite');
            let store = await tx.objectStore(ROOM_TO_STORY_NAME);
            await store.put(object);
            await tx.complete;
            console.log('Added relationship to the store! '+ JSON.stringify(object));
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
async function getRoomNumber(storyNum) {
    let searchResult = []; // return all eligible room numbers
    if (!db)
        await initRoomToStoryDB();
    if (db) {
        console.log('fetching rooms of story: ' + storyNum);
        let tx = await db.transaction(ROOM_TO_STORY_NAME, 'readonly');
        let store = await tx.objectStore(ROOM_TO_STORY_NAME);
        let index = await store.index('storyId');
        let roomNums = await index.getAll(IDBKeyRange.only(storyNum)); // search rooms
        console.log('Room Numbers: ' + JSON.stringify(roomNums));
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
window.getRoomNumber= getRoomNumber;

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
        console.log('fetching story of room: ' + roomNum);
        let tx = await db.transaction(ROOM_TO_STORY_NAME, 'readonly');
        let store = await tx.objectStore(ROOM_TO_STORY_NAME);
        let index = await store.index('roomId');
        let story = await index.get(IDBKeyRange.only(roomNum)); // search story
        console.log('Story id: ' + JSON.stringify(story));
        await tx.complete;

        if (story) {
            return story.storyId;
        } else {
            // if the database is not supported, use localstorage
            const value = localStorage.getItem(roomNum);
            if (value == null)
                console.log('No room discuss this story.'); // there are nothing in localstorage
            else {
                return value.storyId;
            }
        }
    } else {
        const value = localStorage.getItem(roomNum);
        if (value == null)
            console.log('No room discuss this story.'); // there are nothing in localstorage
        else {
            return value.storyId;
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

            /*
            request.onsuccess = async function (event) {
                // get the data item which needed to update
                var data = event.target.result;

                // change the story id
                data.storyId = '555';

                // put back
                await store.put({roomId:roomId, storyId:'000'});
            };

             */

            console.log(request);
            await store.put({roomId:roomId, storyId:storyNum}); // insert new item
            await tx.complete;
        } catch(error) {
            console.log('Error: Can not store the relationship. Reason: '+error);
        }
    }
}
window.updateRelationship= updateRelationship;