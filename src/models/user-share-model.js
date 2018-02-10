import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

/*
 * share of a document
 */
const fields = {
  group: { type: 'ObjectId', required: true },    // share with group
  payload: { type: 'Mixed' },                     // extra info
  subject: { type: 'ObjectId', required: true },  // subject or document
  type: { type: String, required: true },         // subject document type
  user: { type: 'ObjectId', required: true }      // share with user
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.index({ subject: 1, user: 1 });
  return mongoose.model(name, schema);
}

model.schema = fields;