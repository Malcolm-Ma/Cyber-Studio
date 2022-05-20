/*
 *  Written by Tong Chen (tchen64@sheffield.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';


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
                    storyDB.createIndex('story_id', 'story_id', {unique: true, multiEntry: true});
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
 * @param title: title of story
 * @param content: content of story
 * @param author: author of story
 * @param photo: photo url of story
 * @param ifUpdate: update status of story
 */
async function storeStoryToDB(title, content, author, photo, ifUpdate) {
    if (story_db) {
        try{
            let tx = await story_db.transaction(STORY_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORY_STORE_NAME);
            const story_id = generateID();
            await store.put({
                story_id,
                title: title,
                content: content,
                author: author,
                photo: photo,
                date: new Date(),
                ifUpdate: ifUpdate
            });
            await  tx.complete;
            return story_id;
        } catch(error) {
            console.log('error: I could not store the story. Reason: '+error);
        }
    }
}
window.storeStoryToDB= storeStoryToDB;

function generateID(){
    return Math.random().toString(36).slice(-6) + new Date().getTime();
}

async function storeOfflineStory(title, content, author, photo) {
    await storeStoryToDB(title, content, author, photo, false)
}
window.storeOfflineStory= storeOfflineStory;

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

/**
 * it saves the text information of the story when offline
 * @param storyId: id of story
 * @param title: title of story
 * @param content: content of story
 * @param author: author of story
 */
async function storeInfoOffline(storyId, title, content, author) {
    if (story_db) {
        let tx = await story_db.transaction(STORY_STORE_NAME, 'readwrite');
        let store = await tx.objectStore(STORY_STORE_NAME);
        let index = await store.index('story_id');
        let story = await index.get(IDBKeyRange.only(storyId)); // search story

        await store.put({
            story_id: storyId,
            title: title,
            content: content,
            author: author,
            photo: story.photo,
            date: story.date,
            ifUpdate: false
        });
        await tx.complete;
        console.log(`[IndexedDB] Save ${storyId} successfully`)
    }
}
window.storeInfoOffline= storeInfoOffline;


/**
 * it detect all the story which is not update in indexedDB
 * @param stories: list of ids of story of all stories
 * @return unUpdateList: list of ids of all un-updated stories
 */
async function getUnUpdateStory(stories) {
    let unUpdateList = [];
    if (story_db) {
        let tx = await story_db.transaction(STORY_STORE_NAME, 'readwrite');
        let store = await tx.objectStore(STORY_STORE_NAME);
        let index = await store.index('story_id');

        for (let story of stories) {
            let storyData = await index.get(IDBKeyRange.only(story.story_id));
            if(storyData == null || storyData.length === 0){
                unUpdateList.push(story.story_id)
            }
        }
        await tx.complete;

        return unUpdateList;
    }
}
window.getUnUpdateStory= getUnUpdateStory;