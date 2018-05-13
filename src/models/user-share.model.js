const options = {
  timestamps: true
};

/**
 * Share of a document
 */
const fields = {
  hashid: { type: String, required: true },       // unique hash id for sharing
  subject: { type: String, required: true },      // subject or document
  payload: { type: 'Mixed' },                     // extra info
  type: { type: String, required: true },         // subject document type
  user: { type: 'ObjectId', required: true },     // share with user
  group: { type: String }                         // share with group
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.index({ hashid: 1 }, { unique: true });
  schema.index({ subject: 1, group: 1, user: 1 }, { unique: true });
  return mongoose.model(name, schema);
}

model.schema = fields;