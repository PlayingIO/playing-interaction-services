import assert from 'assert';
import makeDebug from 'debug';
import mongoose from 'mongoose';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import { plural } from 'pluralize';

import UserFeedbackModel from '../../models/user-feedback.model';
import defaultHooks from './user-feedback.hooks';

const debug = makeDebug('playing:interaction-services:user-feedbacks');

const defaultOptions = {
  name: 'user-feedbacks'
};

export class UserFeedbackService extends Service {
  constructor (options) {
    options = fp.assign(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  get (id, params) {
    params = fp.assign({ query: {} }, params);
    assert(params.query.user, 'params.query.user not provided');
    params.query.subject = params.query.subject || id;
    return super.first(null, null, params);
  }

  create (data, params) {
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');
    assert(data.user || data.group, 'data.user or data.group not provided.');
    
    const ids = [].concat(data.subject || data.subjects);

    let getSubjects = null;
    if (data.type) {
      const svcSubjects = this.app.service(plural(data.type));
      getSubjects = svcSubjects.find({
        query: {
          _id: { $in: fp.map(id => mongoose.Types.ObjectId(id), ids) },
          $select: ['type']
        },
        paginate: false,
      });
    } else {
      getSubjects = Promise.resolve(fp.map(id => {
        return { id };
      }, ids));
    }

    return getSubjects.then((docs) => {
      if (!docs || docs.length !== ids.length) throw new Error('some data.subject(s) not exists');
      return Promise.all(docs.map((doc) => {
        const feedback = fp.merge({ subject: doc.id, type: doc.type }, data);
        return super.create(feedback);
      }));
    });
  }
}

export default function init (app, options, hooks) {
  options = fp.assign({ ModelName: 'user-feedback' }, options);
  return createService(app, UserFeedbackService, UserFeedbackModel, options);
}

init.Service = UserFeedbackService;
