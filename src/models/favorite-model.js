import timestamps from 'mongoose-timestamp';
import { plugins, getModel } from 'mostly-feathers-mongoose';
import { models } from 'playing-content-services';

const fields = {
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const DocumentModel = getModel(app, 'document', models.document);
  const schema = new mongoose.Schema(fields);
  return DocumentModel.discriminator(name, schema);
}

model.schema = fields;