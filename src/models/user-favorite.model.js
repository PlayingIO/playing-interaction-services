const { plugins } = require('mostly-feathers-mongoose');

const options = {
  timestamps: true
};

/**
 * Sortable list of documents in user's favorite collection
 */
const fields = {
  favorite: { type: 'ObjectId', required: true }, // favorite id
  subject: { type: String, required: true },      // subject or document id
  payload: { type: 'Mixed' },                     // extra info
  type: { type: String, required: true },         // document type
  user: { type: 'ObjectId', required: true }      // user id
};

module.exports = function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.index({ favorite: 1, subject: 1, user: 1 }, { unique: true });
  return mongoose.model(name, schema);
};
module.exports.schema = fields;