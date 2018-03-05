import { plugins } from 'mostly-feathers-mongoose';
import { models as users } from 'playing-user-services';

const options = {
  timestamps: true
};

/*
 * user's permissions list of documents
 */
const fields = {
  document: { type: 'ObjectId', required: true }, // document id
  type: { type: String, required: true },         // document type
  user: { type: 'ObjectId', required: true },     // user/group id
  permission: users.permission.schema             // permission
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.index({ document: 1, user: 1 });
  return mongoose.model(name, schema);
}

model.schema = fields;