import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

/*
 * comments of a document
 */
const fields = {
  audiences: [{ type: 'String' }],                // public/private or somebody
  archived: { type: Boolean, default: false },    // is archived
  content: { type: 'String', required: true },    // content
  likesCount: { type: 'Number', default: 0 },     // number of likes
  mimetype: { type: 'String' },                   // mimetype of content
  subject: { type: 'ObjectId', required: true },  // subject or document
  type: { type: 'String', required: true },       // subject document type
  user: { type: 'ObjectId', required: true }      // commenter id
};

export default function(app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.index({ document: 1, user: 1 });
  return mongoose.model(name, schema);
}