const options = {
  timestamps: true
};

/**
 * feedback of a document
 */
const fields = {
  subject: { type: String },                    // subject or document
  payload: { type: 'Mixed' },                   // extra info
  type: { type: String },                       // subject document type
  user: { type: 'ObjectId', required: true },   // share with user
  comment: { type: String },                    // comment
  rating: { type: Number },                     // rating
  tag: { type: String }                         // tag
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.index({ subject: 1, type: 1, user: 1 });
  return mongoose.model(name, schema);
}

model.schema = fields;