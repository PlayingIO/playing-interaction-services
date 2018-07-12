const assert = require('assert');
const makeDebug = require('debug');
const { Service, helpers, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const UserCollectionModel = require('../../models/user-collection.model');
const defaultHooks = require('./user-collection.hooks');
const { getSubjects, getCollection } = require('../../helpers');

const debug = makeDebug('playing:interaction-services:user-collections');

const defaultOptions = {
  name: 'user-collections'
};

class UserCollectionService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  async find (params) {
    params = { query: {}, ...params };
    params.query.$sort = params.query.$sort || { position: 1 };
    return super.find(params);
  }

  async get (id, params) {
    params = { query: {}, ...params };
    params.query.collect = id || params.query.collect; // id as collection id
    assert(params.query.collect, 'collect is not provided');
    assert(params.query.subject, 'subject is not provided');
    return this.first(params);
  }

  async create (data, params) {
    assert(data.collect, 'collect not provided.');
    assert(data.subject || data.subjects, 'subject(s) not provided.');
    data.type = data.type || 'document';
    data.user = data.user || params.user.id;

    const ids = [].concat(data.subject || data.subjects);
    const [subjects, collection] = await Promise.all([
      getSubjects(this.app, data.type, ids),
      getCollection(this.app, data.collect, data.user)
    ]);
    assert(subjects.length, 'Subject is not exists');
    assert(collection, 'Collection is not exists');

    return Promise.all(fp.map(subject => {
      return super.upsert(null, {
        subject: subject.id,
        collect: collection.id,
        type: subject.type,
        user: data.user
      });
    }, subjects));
  }

  async remove (id, params) {
    params = { query: {}, ...params };
    params.query.collect = id || params.query.collect; // id as collection id
    assert(params.query.collect, 'query.collect not provided.');
    assert(params.query.subject, 'query.subject not provided.');
    params.query.type = params.query.type || 'document';
    params.query.user = params.query.user || params.user.id;

    const ids = params.query.subject.split(',');
    const [subjects, collection] = await Promise.all([
      getSubjects(this.app, params.query.type, ids),
      getCollection(this.app, params.query.collect, params.query.user)
    ]);
    assert(subjects.length, 'Subject is not exists');
    assert(collection, 'Collection is not exists');

    return super.remove(null, {
      query: {
        subject: { $in: ids },
        collect: collection.id,
        user: params.query.user
      },
      provider: params.provider,
      $multi: true
    });
  }

  /*
   * move positions of members in the collection
   */
  async move (id, data, params) {
    assert(data.select, 'select is not provided.');
    assert(data.target, 'target is not provided.');

    debug('move collection member', id, data.select, data.target);
    const [select, target] = await Promise.all([
      this.get(id, { query: { subject: data.select, user: params.user.id } }),
      this.get(id, { query: { subject: data.target, user: params.user.id } })
    ]);
    assert(select, 'select item is not exists');
    assert(target, 'target item is not exists');

    return helpers.reorderPosition(this.Model, select, target.position, {
      idField: 'subject',
      classify: 'collect'
    });
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'user-collection', ...options };
  return createService(app, UserCollectionService, UserCollectionModel, options);
};
module.exports.Service = UserCollectionService;
