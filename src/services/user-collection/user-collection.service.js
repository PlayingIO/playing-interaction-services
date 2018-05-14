import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import UserCollectionModel from '../../models/user-collection.model';
import defaultHooks from './user-collection.hooks';
import { getSubjects, getCollection } from '../../helpers';

const debug = makeDebug('playing:interaction-services:user-collections');

const defaultOptions = {
  name: 'user-collections'
};

export class UserCollectionService extends Service {
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
    assert(data.collect, 'data.collect not provided.');
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');
    data.type = data.type || 'document';

    const ids = [].concat(data.subject || data.subjects);
    const [subjects, collection] = await Promise.all([
      getSubjects(this.app, data.type, ids, params),
      getCollection(this.app, data.collect, params)
    ]);
    return Promise.all(fp.map(subject => {
      return super.upsert(null, {
        subject: subject.id,
        collect: collection.id,
        type: subject.type,
        user: params.user.id
      });
    }, subjects));
  }

  async remove (id, params) {
    params = { query: {}, ...params };
    params.query.collect = id || params.query.collect; // id as collection id
    assert(params.query.collect, 'params.query.collect not provided.');
    assert(params.query.subject, 'query.subject not provided.');
    params.query.type = params.query.type || 'document';

    const ids = params.query.subject.split(',');
    const [subjects, collection] = await Promise.all([
      getSubjects(this.app, params.query.type, ids, params),
      getCollection(this.app, params.query.collect, params)
    ]);

    return super.remove(null, {
      query: {
        subject: { $in: ids },
        collect: collection.id,
        user: params.user.id
      },
      provider: params.provider,
      $multi: true
    });
  }

  /*
   * move positions of members in the collection
   */
  async move (id, data, params) {
    assert(data.select, 'data.select is not provided.');
    assert(data.target, 'data.target is not provided.');

    debug('move collection member', id, data.select, data.target);
    const [select, target] = await Promise.all([
      this.get(id, { query: { subject: data.select, user: params.user.id } }),
      this.get(id, { query: { subject: data.target, user: params.user.id } })
    ]);
    assert(select, 'select item is not exists');
    assert(target, 'target item is not exists');

    return helpers.reorderPosition(this.Model, select, target.position, { classify: 'collect' });
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'user-collection', ...options };
  return createService(app, UserCollectionService, UserCollectionModel, options);
}

init.Service = UserCollectionService;
