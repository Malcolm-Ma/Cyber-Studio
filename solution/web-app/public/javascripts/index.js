/*
 * @Author: Jipu Li 
 * @Date: 2022-03-19 16:49:54 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-16 17:33:01
 */

const createRoomId = document.getElementById('createRoomId')
const createRoomBtn = document.getElementById('createRoomBtn')

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
  roomNo = Math.round(Math.random() * 10000);
  return 'R' + roomNo;
}

const createRoomIdInput = document.querySelector("#createRoomId")
const generateRoomBtn = document.querySelector("#roomNoGenerator")
generateRoomBtn.addEventListener('click', (e) => {
  e.preventDefault()
  createRoomIdInput.value = generateRoom()
})