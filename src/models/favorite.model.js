const { plugins, getModel } = require('mostly-feathers-mongoose');
const { models } = require('playing-content-services');

const fields = {
};

module.exports = function model (app, name) {
  const mongoose = app.get('mongoose');
  const DocumentModel = getModel(app, 'document', models.document);
  const schema = new mongoose.Schema(fields);
  return DocumentModel.discriminator(name, schema);
};
module.exports.schema = fields;