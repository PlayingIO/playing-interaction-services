import { plugins } from 'mostly-feathers-mongoose';

const options = {
  timestamps: true
};

/*
 * sortable list of documents in user's favorite collection
 */
const fields = {
  favorite: { type: 'ObjectId', required: true }, // favorite id
  document: { type: 'ObjectId', required: true }, // document id
  payload: { type: 'Mixed' },                     // extra info
  type: { type: String, required: true },         // document type
  user: { type: 'ObjectId', required: true }      // user id
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(plugins.sortable, { classify: 'favorite' });
  schema.index({ document: 1, user: 1 });
  return mongoose.model(name, schema);
}

model.schema = fields;