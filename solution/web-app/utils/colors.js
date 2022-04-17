/*
 * @Author: Jipu Li 
 * @Date: 2022-04-16 01:42:17 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-17 13:58:53
 */

function randomColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  let rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
  return rgb;
}

module.exports = randomColor