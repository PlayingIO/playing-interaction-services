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
    // id as collection id by default
    params.query.collect = id || params.query.collect;
    params.query.$sort = params.query.$sort || { position: 1 };
    return this.find(params);
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
    if (id) {
      return super.remove(id, params);
    } else {
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
  }

  async reorder (id, data, params) {
    const [original, target] = await Promise.all([
      this.get(params.primary),
      this.get(data.target)
    ]);
    assert(original, 'original collection is not exists');
    assert(target, 'target collection is not exists');

    return helpers.reorderPosition(this.Model, original, target.position, { classify: 'collect' });
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'user-collection', ...options };
  return createService(app, UserCollectionService, UserCollectionModel, options);
}

init.Service = UserCollectionService;
