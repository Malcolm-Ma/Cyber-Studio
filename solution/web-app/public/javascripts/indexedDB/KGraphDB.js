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
            await tx.complete;
            console.log('Added knowledge graph to the store');
        } catch(error) {
            console.log('Error: Could not store the knowledge. Reason: '+error);
        }
    }
    else localStorage.setItem(addObject.content, JSON.stringify(addObject));
}
window.storeKGraph= storeKGraph;

/**
 * it retrieves all the knowledge that have searched in the roomNum
 * if the database is not supported, it will use localstorage
 * @param roomNum: id of room
 * @returns a list of knowledge items
 */
async function getKGraphList(roomNum) {
    let searchResult = []; // return the knowledge list of roomNum
    if (k_graph_db) {
        let tx = await k_graph_db.transaction(GRAPH_STORE_NAME, 'readonly');
        let store = await tx.objectStore(GRAPH_STORE_NAME);
        let index = await store.index('roomId');
        let knowledges = await index.getAll(IDBKeyRange.only(roomNum)); // read all history knowledge in this room
        await tx.complete;

        if (knowledges && knowledges.length > 0) {
            for (let elem of knowledges){
                searchResult.push(elem); // save knowledge in list
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
window.getKGraphList= getKGraphList;
