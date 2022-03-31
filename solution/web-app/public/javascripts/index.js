/*
 * @Author: Jipu Li 
 * @Date: 2022-03-19 16:49:54 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-01 00:38:56
 */


const createRoomId = document.getElementById('createRoomId')

const createRoomBtn = document.getElementById('createRoomBtn')

console.log("this is story id", storyId)

createRoomBtn.addEventListener('click', (e) => {
  e.preventDefault()

  const roomId = createRoomId.value
  console.log(roomId)

  const data = {"roomId": roomId}

  fetch('http://localhost:3001/room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data)
  },
  )
})


