/**
 * @file Declare stories collection
 * @author Mingze Ma
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const storySchema = new Schema(
  {
    title: { type: String, required: true },
    author_name: { type: String, required: true },
    description: String,
    photo_id: Schema.Types.ObjectId
  },
  {
    timestamps: {
      createdAt: 'created_time', // Use `created_at` to store the created date
      updatedAt: false
    }
  }
);

module.exports = mongoose.model('Story', storySchema);
