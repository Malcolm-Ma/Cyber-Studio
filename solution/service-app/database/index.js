const mongoose = require('mongoose');

const { MONGODB_URL } = require('../configure/database');

mongoose.Promise = global.Promise;

connection = mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  checkServerIdentity: false,
})
  .then(() => {
    console.info(`Connection to ${MONGODB_URL} worked!`);
  })
  .catch((error) => {
    console.error(`connection to ${MONGODB_URL} did not work! See error: ${JSON.stringify(error)}`);
  });
