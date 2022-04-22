/*
 * @Author: Jipu Li 
 * @Date: 2022-03-20 00:03:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-20 23:55:13
 */

const moment = require('moment')

function formatMessage(name, text) {
  return {
    name: name,
    text,
    time: moment().format('h:mm a')
  }
}

module.exports = formatMessage