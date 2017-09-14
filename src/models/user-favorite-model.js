import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

/*
 * sortable list of documents in user's favorite collection
 */
const fields = {
  favorite: { type: 'ObjectId', required: true }, // favorite id
  document: { type: 'ObjectId', required: true }, // document id
  type: { type: 'String', required: true },       // document type
  user: { type: 'ObjectId', required: true }      // user id
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.plugin(plugins.sortable, { classify: 'favorite' });
  schema.index({ document: 1, user: 1 });
  return mongoose.model(name, schema);
}

model.schema = fields;