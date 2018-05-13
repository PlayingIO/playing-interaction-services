import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import UserLikeModel from '../../models/user-like.model';
import defaultHooks from './user-like.hooks';
import { getSubjects } from '../../helpers';

const debug = makeDebug('playing:interaction-services:user-likes');

const defaultOptions = {
  name: 'user-likes'
};

export class UserLikeService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  get (id, params) {
    params = { query: {}, ...params };
    assert(params.query.user, 'params.query.user not provided');
    params.query.subject = params.query.subject || id;
    return super.first(params);
  }

  async create (data, params) {
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');
    data.type = data.type || 'document';

    const ids = [].concat(data.subject || data.subjects);
    const subjects = await getSubjects(this.app, data.type, ids, params);

    return Promise.all(fp.map(subject => {
      return super.upsert(null, {
        subject: subject.id,
        type: subject.type,
        user: params.user.id
      });
    }, subjects));
  }

  async remove (id, params) {
    if (id) {
      return super.remove(id, params);
    } else {
      assert(params.query.subject, 'query.subject is not provided.');
      params.query.type = params.query.type || 'document';

      const ids = params.query.subject.split(',');
      const subjects = await getSubjects(this.app, params.query.type, ids, params);

      return super.remove(null, {
        query: {
          subject: { $in: ids },
          user: params.query.user
        },
        $multi: true
      });
    }
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'user-like', ...options };
  return createService(app, UserLikeService, UserLikeModel, options);
}

init.Service = UserLikeService;
