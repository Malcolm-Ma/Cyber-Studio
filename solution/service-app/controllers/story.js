/**
 * @file Controller for stories
 * @author Mingze Ma
 */

const mongoose = require('mongoose');

const requestUtils = require('../utils/requestUtils');

const Story = require('../models/stories');

const assetController = require('./asset');

const projectionPipeline = {
  _id: 0,
  story_id: {
    $ifNull: ['$story_id', '$_id']
  },
  title: 1,
  content: 1,
  author: 1,
  date: 1,
  photo: {
    // Take url from object in array
    $let: {
      vars: {
        firstMember: {
          $arrayElemAt: ["$photo_info", 0]
        }
      },
      in: '$$firstMember.url',
    },
  },
};

const getStoryList = (req, res) => {
  const allowedOrder = ['date', '-date', 'author', '-author'];
  const { order = '-date' } = req.query;
  if (!!order && !allowedOrder.some(item => item === order)) {
    requestUtils.buildErrorResponse(res, {
      status: 400,
      error: new Error('Invalid parameter Error'),
      message: 'Invalid parameter: { order }!',
    });
    return;
  }
  Story.aggregate()
    // join Assets
    .lookup({
      from: 'assets',
      localField: 'photo_id',
      foreignField: '_id',
      as: 'photo_info',
    })
    // handle raw data
    .project(projectionPipeline)
    // sort by date
    .sort(order || '-date')
    .exec()
    .then(stories => {
      requestUtils.buildSuccessResponse(res, {
        data: stories,
      });
    })
    .catch((err) => {
      requestUtils.buildErrorResponse(res, {
        error: err,
        message: 'Invalid data or not found!',
      });
    });
};

const createStory = async (req, res) => {
  const params = req.body;
  // check data format
  if (params == null) {
    requestUtils.buildErrorResponse(res, {
      status: 403,
      error: new Error('No data sent!'),
      message: 'No data sent!',
    });
    return;
  }

  // insert new story
  const currentAsset = await assetController.findAssetByPath(params.photo);
  const newStory = new Story({
    title: params.title,
    author: params.author,
    content: params.content,
    date: new Date(),
    photo_id: currentAsset._id,
  });
  // save new story to db
  newStory.save()
    .then((result) => {
      requestUtils.buildSuccessResponse(res, {
        data: {
          story_id: result._id,
        }
      })
    })
    .catch((err) => {
      requestUtils.buildErrorResponse(res, {
        message: 'Could not insert - probably incorrect data! ',
        error: err,
      });
    });
};

const createStoryInBulk = async (req, res) => {
  const { story_list } = req.body;
  console.log('story_list', story_list)
  // check data format
  if (!story_list) {
    requestUtils.buildErrorResponse(res, {
      status: 400,
      error: new Error('No data sent!'),
      message: 'No data sent!',
    });
    return;
  }

  if (!Array.isArray(story_list)) {
    requestUtils.buildErrorResponse(res, {
      status: 400,
      error: new Error('Invalid story_list format'),
      message: 'Invalid story_list format!',
    });
    return;
  }

  const newStoryList = story_list || [];

  // check each new story params in the list
  const requiredKeys = ['title', 'author', 'content', 'story_id', 'date', 'photo', 'ifUpdate'];
  const containFullKeys = newStoryList.every((story) => {
    return JSON.stringify(Object.keys(story).sort()) === JSON.stringify(requiredKeys.sort());
  });
  if (!containFullKeys) {
    requestUtils.buildErrorResponse(res, {
      status: 400,
      error: new Error('Invalid object format in story_list. Some objects are lack of fields.'),
      message: 'Invalid object format in story_list. Some objects are lack of fields.',
    });
    return;
  }

  const storySavingPromise = newStoryList.map(async (story) => {
    const { title, author, content, date, story_id, photo } = story;
    const photoId = await assetController.saveImage(photo)
      .catch((err) => {
        requestUtils.buildErrorResponse(res, {
          message: 'Could not insert - probably incorrect data! ',
          error: err,
        });
      });
    // insert new story
    const newStory = {
      story_id,
      title,
      author,
      content,
      date,
      photo_id: photoId,
    };
    return newStory;
  });

  Promise.all(storySavingPromise).then((response) => {
    Story.insertMany(response)
      .then((results) => {
        console.log('results', results)
            requestUtils.buildSuccessResponse(res, {
              data: {
                story_id_list: results.map(value => value.story_id),
              }
            })
          })
          .catch((err) => {
            requestUtils.buildErrorResponse(res, {
              message: 'Could not insert - probably incorrect data! ',
              error: err,
            });
          });
  });

};

const getStoryDetail = (req, res) => {
  const params = req.query;
  const { story_id: id } = params;
  if (!id) {
    requestUtils.buildErrorResponse(res, {
      status: 403,
      error: new Error('Invalid id, please try again.'),
      message: 'Invalid id, please try again.',
    });
    return;
  }
  let match = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    match = { _id: mongoose.Types.ObjectId(id) };
  } else {
    match = { story_id: id };
  }
  // search and aggregate
  Story.aggregate()
    .match(match)
    // join Assets
    .lookup({
      from: 'assets',
      localField: 'photo_id',
      foreignField: '_id',
      as: 'photo_info',
    })
    // handle raw data
    .project(projectionPipeline)
    .exec()
    .then(stories => {
      console.log('--stories--\n', stories);
      requestUtils.buildSuccessResponse(res, {
        data: stories[0] || {},
      });
    })
    .catch((err) => {
      requestUtils.buildErrorResponse(res, {
        error: err,
        message: 'Invalid data or not found!',
      });
    });
};

module.exports = {
  getStoryList,
  createStory,
  getStoryDetail,
  createStoryInBulk,
};
