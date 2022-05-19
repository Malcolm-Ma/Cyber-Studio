/**
 * @file utils for mongodb in front end
 * @author Mingze Ma
 */

const mongoose = require('mongoose');

const generateObjectId = () => {
  return mongoose.Types.ObjectId().toString();
}

module.exports = {
  generateObjectId,
};
