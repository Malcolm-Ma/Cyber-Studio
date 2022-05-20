/*
 * @Author: Jipu Li 
 * @Date: 2022-03-20 00:03:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-05-20 16:16:35
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
    time: moment().format('MMMM Do YYYY, h:mm:ss a')
  }
}

module.exports = formatMessage