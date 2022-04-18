/*
 *  Written by Tong Chen (tchen64@sheffield.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';
//import * as idb from './idb/index.js';


////////////////// DATABASE //////////////////
let db;

// Define the names of databases and object stores
const STORY_STORE_NAME= 'store_story';
const ROOM_TO_STORY_NAME= 'store_room_to_story';

// Export to the window namespace
window.STORY_STORE_NAME = STORY_STORE_NAME;
window.ROOM_TO_STORY_NAME = ROOM_TO_STORY_NAME;

// the database receives from the server the following structure
const storyData = [
    { title: "IceSnow", author: "Tong", description: "It is a happy ending.", photoId: "ascv123jsfgiu"},//, timestamp}
];

/**
 * it inits the story database and set key path
 */
async function initStoryDB(){
    if (!db) {
        db = await idb.openDB(MSG_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {

                // Check if there exists story database; if not, create a new database for story
                if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
                    let storyDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {
                        keyPath: 'storyId', // story id is unique for each story
                        autoIncrement: true
                    });
                }
            }
        });
        console.log('Story database created');
    }
}
window.initStoryDB= initStoryDB;

/**
 * it saves a new story into the database
 * if the database is not supported, it will use localstorage
 * @param storyObject
 */
async function storeStory(storyObject) {
    console.log('inserting: '+JSON.stringify(storyObject));
    if (!db)
        await initStoryDB();
    if (db) {
        try{
            let tx = await db.transaction(STORY_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORY_STORE_NAME);
            await store.put(storyObject);
            await  tx.complete;
            console.log('added item to the store! '+ JSON.stringify(storyObject));
        } catch(error) {
            console.log('error: I could not store the element. Reason: '+error);
        }
    }
    else localStorage.setItem(storyObject.content, JSON.stringify(storyObject));
}
window.storeStory= storeStory;

/**
 * it retrieves all the information of story
 * if the database is not supported, it will use localstorage
 * @param storyNum: id of story
 * @returns data item of story
 */
async function getStory(storyNum) {
    let searchResult = []; // return all information about story
    if (!db)
        await initStoryDB();
    if (db) {
        console.log('fetching: ' + storyNum);
        let tx = await db.transaction(STORY_STORE_NAME, 'readonly');
        let store = await tx.objectStore(STORY_STORE_NAME);
        let index = await store.index('storyId');
        let storyInfo = await index.getAll(IDBKeyRange.only(storyNum)); // search story
        console.log('Story: ' + JSON.stringify(storyInfo));
        await tx.complete;

        if (storyInfo && storyInfo.length > 0) {
            for (let elem of storyInfo){
                searchResult.push(elem); // save message in list
            }
        } else {
            // if the database is not supported, use localstorage
            const value = localStorage.getItem(storyNum);
            if (value == null)
                console.log('This story is not exits.'); // there are nothing in localstorage
            else {
                searchResult.push(value);
            }
        }
    } else {
        const value = localStorage.getItem(storyNum);
        if (value == null)
            console.log('This story is not exits.'); // there are nothing in localstorage
        else {
            searchResult.push(value);
        }
    }

    return searchResult;
}
window.getStory= getStory;