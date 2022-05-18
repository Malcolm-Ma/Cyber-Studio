/*
 * @Author: Jipu Li 
 * @Date: 2022-03-20 00:03:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-05-18 16:57:07
 */

const moment = require('moment')

/**
 * format message
 * @param {*} name the name of person who sent message
 * @param {*} text the content of chat message
 * @returns 
 */
function formatMessage(name, text) {
  return {
    name: name,
    text,
    time: moment().format('h:mm a')
  }
}

module.exports = formatMessage