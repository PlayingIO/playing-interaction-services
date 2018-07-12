const options = {
  timestamps: true
};

/**
 * Comments of a document
 */
const fields = {
  subject: { type: String, required: true },      // subject or document id
  payload: { type: 'Mixed' },                     // extra info
  type: { type: String, required: true },         // subject document type
  user: { type: 'ObjectId', required: true },     // commenter id
  audiences: [{ type: String }],                  // public/private or somebody
  collpased: { type: Boolean, default: false },   // is collpased
  archived: { type: Boolean, default: false },    // is archived
  comment: { type: String, required: true },      // comment
  commentedAt: { type: Date }                     // commented at
};

module.exports = function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.index({ subject: 1, type: 1, user: 1 });
  schema.index({ commentedAt: 1, user: 1 });
  return mongoose.model(name, schema);
};
module.exports.schema = fields;