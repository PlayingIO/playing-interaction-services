import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';
import UserCommentModel from '~/models/user-comment-model';
import defaultHooks from './user-comment-hooks';

const debug = makeDebug('playing:interaction-services:user-comments');

const defaultOptions = {
  name: 'user-comments'
};

class UserCommentService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  get(id, params) {
    params = Object.assign({ query: {} }, params);
    assert(params.query.user, 'params.query.user not provided');
    params.query.subject = params.query.subject || id;
    return super._first(null, null, params);
  }

  create(data, params) {
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');
    assert(data.type, 'data.type not provided');
    assert(data.user, 'data.user not provided.');
    assert(data.comment, 'data.comment not provided.');

    const subjects = this.app.service(plural(data.type));
    
    const ids = [].concat(data.subject || data.subjects);

    const getSubjects = subjects.find({
      query: { _id: { $in: ids }, $select: ['type'] },
      paginate: false,
    });

    return getSubjects.then((docs) => {
      if (!docs || docs.length !== ids.length) throw new Error('some data.subject(s) not exists');
      return Promise.all(docs.map((doc) => {
        return super._upsert(null, data, {
          subject: doc.id,
          type: doc.type,
          user: data.user
        });
      }));
    });
  }

  remove(id, params) {
    params = Object.assign({ query: {} }, params);
    assert(params.query.userId || params.query.user, 'params.query.userId not provided');
    assert(params.query.commentedAt, 'params.query.commentedAt not provided');
    params.query.subject = params.query.subject || id;
    return super.remove(null, { query: {
      subject: params.query.subject,
      user: params.query.userId || params.query.user,
      commentedAt: params.query.commentedAt,
      $multi: true
    }});
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'user-comment' }, options);
  return createService(app, UserCommentService, UserCommentModel, options);
}

init.Service = UserCommentService;
