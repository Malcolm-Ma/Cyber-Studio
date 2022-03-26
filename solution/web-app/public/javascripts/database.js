/*
 *  Copyright (C) The University of Sheffield - All Rights Reserved
 *  Written by Fabio Ciravegna (f.ciravegna@shef.ac.uk)
 *
 */

import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';


////////////////// DATABASE //////////////////
// the database receives from the server the following structure

/** class WeatherForecast{
 *  constructor (location, date, forecast, temperature, wind, precipitations) {
 *    this.location= location;
 *    this.date= date,
 *    this.forecast=forecast;
 *    this.temperature= temperature;
 *    this.wind= wind;
 *    this.precipitations= precipitations;
 *  }
 *}
 */
let db;

const MSG_DB_NAME= 'db_msg';
const MSG_STORE_NAME= 'store_msg';
const STORY_STORE_NAME= 'store_story';

// Static exist message
const messageData = [
    { roomId: 1, isSelf: true, msgNum: 1, content: "Hi, I'm Tong." , time, accountId},
    { roomId: 1, isSelf: false, msgNum: 2, content: "Hi, I'm Mary." },
    { roomId: 1, isSelf: true, msgNum: 3, content: "Nice to meet you." },
    { roomId: 2, isSelf: true, msgNum: 1, content: "Hello." }
];

// photo_id -- photo base 64
// local story DB-- used when offline
// message database
// 关系表 -- roomId & storyId & empty
// 按照时间确定msgNum

// 生成roomId（ABC123）和accountId（123）每个用户都可以有几个id。每次进入一个room就随机生成一个id。npm.uuid

// 创建room

// check room
// story变了 & 有人 -》不能进；story没变 & 有人 -》 加入房间； story变了 & 没人 -》 进房间且选择清记录，改变story关系；story没变 & 没人 -》 进房间

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
 * it saves the story into the database
 * if the database is not supported, it will use localstorage
 * @param storyObject: it contains {  }
 */
async function storeStory(storyObject) {
    console.log('inserting: '+JSON.stringify(storyObject));
    if (!db)
        await initMessageDB();
    if (db) {
        try{
            let tx = await db.transaction(STORY_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORY_STORE_NAME);
            await store.put(storyObject);
            await  tx.complete;
            console.log('added story to the store! '+ JSON.stringify(storyObject));
        } catch(error) {
            console.log('error: I could not store the story. Reason: '+error);
        }
    }
    else localStorage.setItem(storyObject.content, JSON.stringify(storyObject));
}
window.storeStory= storeStory;
