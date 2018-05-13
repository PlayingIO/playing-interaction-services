import assert from 'assert';
import makeDebug from 'debug';
import mongoose from 'mongoose';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import UserFeedbackModel from '../../models/user-feedback.model';
import defaultHooks from './user-feedback.hooks';
import { getSubjects } from '../../helpers';

const debug = makeDebug('playing:interaction-services:user-feedbacks');

const defaultOptions = {
  name: 'user-feedbacks',
  payloads: ['os', 'osVersion', 'deviceType', 'app', 'appVersion']
};

export class UserFeedbackService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  find (params) {
    params = { query: {}, ...params };
    params.query.user = params.query.user || params.user.id;
    return super.find(params);
  }

  get (id, params) {
    params = { query: {}, ...params };
    params.query.subject = params.query.subject || id;
    params.query.user = params.query.user || params.user.id;
    return super.first(params);
  }

  async create (data, params) {
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');
    const payload = fp.pick(this.options.payloads, data);

    const ids = [].concat(data.subject || data.subjects);

    let subjects = ids;
    if (data.type) {
      subjects = await getSubjects(this.app, data.type, ids, params);
    }

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

export default function init (app, options, hooks) {
  options = { ModelName: 'user-feedback', ...options };
  return createService(app, UserFeedbackService, UserFeedbackModel, options);
}

init.Service = UserFeedbackService;
