/**
 * @file Init data in MongoDB
 * @author Mingze Ma
 */

const { faker } = require('@faker-js/faker');
const base64 = require('node-base64-image');

const { DEMO_AMOUNT } = require('../configure/database');

const Story = require('../models/stories');
const Asset = require('../models/assets');

exports.init = async () => {
  /**
   * uncomment above if you need to drop the database
   */
  Story.remove({}, (err) => {
    console.info('Story collection removed');
  });
  Asset.remove({}, (err) => {
    console.info('Asset collection removed');
    console.info('Loading images, please wait about 10 seconds...');
  });

  let assetBase64 = [];

  for (let i = 0; i < DEMO_AMOUNT; i++) {
    const url = faker.image.image();
    let bitmap = '';
    try {
      bitmap = await base64.encode(url, {string: true});
    } catch (e) {
      console.error(e);
    }
    assetBase64.push(bitmap);
    // sleep for solving 503 error
    setTimeout(() => {}, 10);
  }

  const assetDemo = assetBase64.map((base64) => {
    return {
      file_name: faker.word.noun(),
      base64,
    }
  });

  let photoIds = [];
  await Asset.create(assetDemo)
    .then((results) => {
      console.log('Assets create success!');
      photoIds = results.map(value => value._id);
    })
    .catch((error) => {
      console.log(JSON.stringify(error));
    });

  // Init container for demo document
  const storyDemo = photoIds.map((value) => {
    return {
      title: faker.random.words(Math.ceil(Math.random() * 6)),
      content: faker.random.words(50),
      date: faker.date.recent(),
      author: faker.name.findName(),
      photo_id: value,
    };
  });

  await Story.create(storyDemo)
    .then((results) => {
      console.log('Stories create success!');
    })
    .catch((error) => {
      console.log(JSON.stringify(error));
    });

};
