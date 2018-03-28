import { plugins } from 'mostly-feathers-mongoose';

const options = {
  timestamps: true
};

/**
 * Sortable list of user collection documents
 */
const fields = {
  collect: { type: 'ObjectId', required: true },  // collection id
  document: { type: 'ObjectId', required: true }, // document id
  payload: { type: 'Mixed' },                     // extra info
  type: { type: String, required: true },         // document type
  user: { type: 'ObjectId', required: true }      // user id
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(plugins.sortable, { classify: 'collect' });
  schema.index({ collect: 1, document: 1, user: 1 }, { unique: true });
  return mongoose.model(name, schema);
}

model.schema = fields;