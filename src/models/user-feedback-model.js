import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

/*
 * feedback of a document
 */
const fields = {
  comment: { type: 'String' },                    // comment
  rating: { type: 'Number' },                     // rating
  tag: { type: 'String' },                        // tag
  payload: { type: 'Mixed' },                     // extra info
  subject: { type: 'String' },                    // subject or document
  type: { type: 'String' },                       // subject document type
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