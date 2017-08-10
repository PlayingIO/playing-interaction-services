import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

/*
 * sortable list of document colleciton
 */

const fields = {
  parent: { type: 'ObjectId' },   // collection id
  category: { type: 'String' },   // collection type
  document: { type: 'ObjectId' }, // document id
  type: { type: 'String' },       // document type
  creator: { type: 'ObjectId' }
};

export default function(app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.plugin(plugins.sortable, { classify: 'parent' });
  return mongoose.model(name, schema);
}