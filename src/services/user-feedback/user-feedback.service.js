const assert = require('assert');
const makeDebug = require('debug');
const mongoose = require('mongoose');
const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const UserFeedbackModel = require('../../models/user-feedback.model');
const defaultHooks = require('./user-feedback.hooks');
const { getSubjects } = require('../../helpers');

const debug = makeDebug('playing:interaction-services:user-feedbacks');

const defaultOptions = {
  name: 'user-feedbacks',
  payloads: ['os', 'osVersion', 'deviceType', 'app', 'appVersion']
};

class UserFeedbackService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  async get (id, params) {
    params = { query: {}, ...params };
    params.query.subject = params.query.subject || id;
    return super.first(params);
  }

  async create (data, params) {
    assert(data.subject || data.subjects, 'subject(s) is not provided.');
    data.type = data.type || 'document';

    const payload = fp.pick(this.options.payloads, data);
    const ids = [].concat(data.subject || data.subjects);

    const subjects = await getSubjects(this.app, data.type, ids);
    assert(subjects.length, 'Subject is not exists');

    return Promise.all(fp.map(subject => {
      return super.upsert(null, {
        subject: subject.id,
        type: subject.type,
        comment: data.comment,
        rating: data.rating,
        tag: data.tag,
        user: params.user.id,
        payload: payload
      });
    }, subjects));
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'user-feedback', ...options };
  return createService(app, UserFeedbackService, UserFeedbackModel, options);
};
module.exports.Service = UserFeedbackService;
