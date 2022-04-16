/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 12:05:22 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-16 17:15:35
 */

let socket = io()
let roomNo = null
let name = null
let imgUrl = '/images/landmark03.jpeg'

const params = window.location.pathname
const regex = /[0-9]+/
const roomId = params.match(regex)[0]

socket.emit('joinRoom', roomId)
// get color from server


function init(){
  initCanvas(socket, imgUrl)
}

window.onload = init
