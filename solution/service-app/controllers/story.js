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
  story_id: '$_id',
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
  const allowedOrder = ['data', '-date', 'author', '-author'];
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

const getStoryDetail = (req, res) => {
  const params = req.query;
  console.log('--params--\n', params);
  const { story_id: id } = params;
  if (!id) {
    requestUtils.buildErrorResponse(res, {
      status: 403,
      error: new Error('Invalid id, please try again.'),
      message: 'Invalid id, please try again.',
    });
    return;
  }
  // search and aggregate
  Story.aggregate()
    .match({
      _id: mongoose.Types.ObjectId(id),
    })
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
};
