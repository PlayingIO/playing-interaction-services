import { plugins } from 'mostly-feathers-mongoose';

const options = {
  timestamps: true
};

/*
 * list of documents liked by user (kudos)
 */
const fields = {
  document: { type: 'ObjectId', required: true }, // document id
  payload: { type: 'Mixed' },                     // extra info
  type: { type: String, required: true },         // document type
  user: { type: 'ObjectId', required: true }      // user id
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.index({ document: 1, user: 1 }, { unique: true });
  return mongoose.model(name, schema);
}

model.schema = fields;