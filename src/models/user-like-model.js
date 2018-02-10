import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

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
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.index({ document: 1, user: 1 });
  return mongoose.model(name, schema);
}

model.schema = fields;