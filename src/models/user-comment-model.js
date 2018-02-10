import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

/*
 * comments of a document
 */
const fields = {
  audiences: [{ type: String }],                  // public/private or somebody
  archived: { type: Boolean, default: false },    // is archived
  comment: { type: String, required: true },      // comment
  commentedAt: { type: Date },                    // commented at
  likesCount: { type: Number, default: 0 },       // number of likes
  mimetype: { type: String },                     // mimetype of content
  payload: { type: 'Mixed' },                     // extra info
  subject: { type: 'ObjectId', required: true },  // subject or document
  type: { type: String, required: true },         // subject document type
  user: { type: 'ObjectId', required: true }      // commenter id
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.index({ subject: 1, user: 1 });
  return mongoose.model(name, schema);
}

model.schema = fields;