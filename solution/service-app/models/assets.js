/**
 * @file Declare assets collection
 * @author Mingze Ma
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const assetSchema = new Schema(
  {
    file_name: String,
    base64: { type: String, required: true },
    url: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: 'created_time', // Use `created_at` to store the created date
      updatedAt: false
    }
  }
);

module.exports = mongoose.model('Asset', assetSchema);
