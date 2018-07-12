const options = {
  timestamps: true
};

/**
 * Last read time of each kind of alerts of a user
 */
const fields = {
  alerts: { type: 'Mixed' },                  // last read time of each kind of alerts
                                              // e.g. { <alertId>: new Date() }
  user: { type: 'ObjectId', required: true }  // share with user
};

module.exports = function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.index({ user: 1 });
  return mongoose.model(name, schema);
};
module.exports.schema = fields;