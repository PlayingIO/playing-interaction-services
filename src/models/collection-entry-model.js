import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

const fields = {
  parent: { type: 'ObjectId' }, // collection
  entry: { type: 'ObjectId' },  // document id
  type: { type: 'String' },     // document type
  owner: { type: 'ObjectId' }
};

export default function(app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.plugin(plugins.sortable);
  return mongoose.model(name, schema);
}