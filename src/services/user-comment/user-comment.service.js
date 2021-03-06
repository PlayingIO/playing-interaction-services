const assert = require('assert');
const makeDebug = require('debug');
const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const UserCommentModel = require('../../models/user-comment.model');
const defaultHooks = require('./user-comment.hooks');
const { getSubjects } = require('../../helpers');

const debug = makeDebug('playing:interaction-services:user-comments');

const defaultOptions = {
  name: 'user-comments'
};

class UserCommentService extends Service {
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
    return this.find(params);
  }

  async create (data, params) {
    assert(data.subject || data.subjects, 'subject(s) not provided.');
    assert(data.comment, 'comment not provided.');
    data.type = data.type || 'document';

    const ids = [].concat(data.subject || data.subjects);
    const subjects = await getSubjects(this.app, data.type, ids);
    assert(subjects.length, 'Subject is not exists');

    return Promise.all(fp.map(subject => {
      return super.upsert(null, {
        subject: subject.id,
        type: subject.type,
        comment: data.comment,
        commentedAt: data.commentedAt,
        audiences: data.audiences,
        user: params.user.id
      });
    }, subjects));
  }

  async remove (id, params) {
    params = { query: {}, ...params };
    assert(params.query.commentedAt, 'query.commentedAt is not provided');
    const type = params.query.type || 'document';
    const subjectId = params.query.subject || id;
    const userId = params.query.userId || params.user.id;

    const subjects = await getSubjects(this.app, type, [subjectId]);
    assert(subjects.length, 'Subject is not exists');

    const subject = subjects[0];
    // TODO check with permission rules
    if (!fp.idEquals(userId, params.user.id) ||
        !fp.idEquals(subject.creator, params.user.id))
    {
      throw new Error('Delete comment is not allowed');
    }

    return super.remove(null, { query: {
      subject: subjectId,
      user: subjectId,
      commentedAt: params.query.commentedAt,
      $multi: true
    }});
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'user-comment', ...options };
  return createService(app, UserCommentService, UserCommentModel, options);
};
module.exports.Service = UserCommentService;
