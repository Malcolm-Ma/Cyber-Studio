/*
 *  Written by Tong Chen (tchen64@sheffield.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';
//import * as idb from './idb/index.js';


////////////////// DATABASE //////////////////
let story_db;

// Define the names of databases and object stores
const STORY_DB_NAME= 'db_story';
const STORY_STORE_NAME= 'store_story';

// Export to the window namespace
window.STORY_DB_NAME = STORY_DB_NAME;
window.STORY_STORE_NAME = STORY_STORE_NAME;

// the database receives from the server the following structure
const storyData = [
    { title: "IceSnow", content: "It is a happy ending.", author: "Tong", photoId: "ascv123jsfgiu", ifUpdate: true},//, timestamp}
];

/**
 * it inits the story database and set key path
 */
async function initStoryDB(){
    if (!story_db) {
        story_db = await idb.openDB(STORY_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {

                // Check if there exists story database; if not, create a new database for story
                if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
                    let storyDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {
                        keyPath: 'story_id', // story id is unique for each story
                    });
                    storyDB.createIndex('ifUpdate', 'ifUpdate', {unique: false, multiEntry: true});
                    storyDB.createIndex('author', 'author', {unique: false, multiEntry: true});
                    // storyDB.createIndex('date', 'date', {unique: false, multiEntry: true});
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
 */
async function storeStoryToDB(title, content, author, photo, ifUpdate) {
    if (story_db) {
        try{
            let tx = await story_db.transaction(STORY_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORY_STORE_NAME);
            await store.put({
                story_id: generateID(),
                title: title,
                content: content,
                author: author,
                photo: photo,
                ifUpdate: ifUpdate
            });
            await  tx.complete;
            console.log('added story to the store! '+ JSON.stringify(storyObject));
        } catch(error) {
            console.log('error: I could not store the story. Reason: '+error);
        }
    }
    else localStorage.setItem(storyObject.content, JSON.stringify(storyObject));
}
window.storeStoryToDB= storeStoryToDB;

function generateID(){
    return Math.random().toString(36).slice(-6) + new Date().getTime();
}

async function storeOfflineStory(title, content, author, photo) {
    await storeStoryToDB(title, content, author, photo, false)
}

async function storeOnlineStory(title, content, author, photo) {
    await storeStoryToDB(title, content, author, photo, true)
}

/**
 * it retrieves all the information of story
 * if the database is not supported, it will use localstorage
 * @returns data item of stories
 */
async function getOfflineStoryList() {
    let searchResult = []; // return all information about story
    if (story_db) {
        let tx = await story_db.transaction(STORY_STORE_NAME, 'readonly');
        let store = await tx.objectStore(STORY_STORE_NAME);
        let index = await store.index('ifUpdate');
        let storyInfo = await index.getAll(IDBKeyRange.only(false)); // search story
        console.log('Un-update Story: ' + JSON.stringify(storyInfo));
        await tx.complete;

        if (storyInfo && storyInfo.length > 0) {
            for (let elem of storyInfo){
                searchResult.push(elem); // save message in list
            }
        }
    }
    return searchResult;
}
window.getOfflineStoryList= getOfflineStoryList;