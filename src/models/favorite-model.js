import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

const fields = {
  user: { type: 'ObjectId', required: true },
  favoriteId: { type: 'String', required: true },
  favoriteType: { type: 'String', required: true },
  favoriteModel: { type: 'String', required: true },
  category: { type: 'String', required: true, enum: ['LIKE', 'FAVORITE'] },
};

export default function(app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.plugin(plugins.softDelete);
  return mongoose.model(name, schema);
}