import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import UserCollectionModel from '../../models/user-collection.model';
import defaultHooks from './user-collection.hooks';

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

  find (params) {
    params = { query: {}, ...params };
    params.query.user = params.query.user || params.user.id;
    params.query.$sort = params.query.$sort || { position: 1 };

    return super.find(params);
  }

  get (id, params) {
    params = { query: {}, ...params };
    params.query.subject = params.query.subject || id;
    params.query.user = params.query.user || params.user.id;
    return this.first(params);
  }

  create (data, params) {
    assert(data.collect, 'data.collect not provided.');
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');

    const svcDocuments = this.app.service('documents');
    const svcCollections = this.app.service('collections');
    
    const ids = [].concat(data.subject || data.subjects);

    const getDocuments = () => svcDocuments.find({ query: { _id: { $in: ids } } });
    const getCollection = () => svcCollections.get(data.collect);

    return Promise.all([
      getDocuments(),
      getCollection()
    ]).then(([results, collection]) => {
      const docs = results && results.data || results;
      if (!docs || docs.length !== ids.length) throw new Error('some data.subject(s) not exists');
      if (!collection) throw new Error('parent collection not exists');
      return Promise.all(docs.map((doc) => {
        return super.upsert(null, {
          subject: doc.id,
          collect: collection.id,
          type: doc.type,
          user: params.user.id
        });
      }));
    });
  }

  remove (id, params) {
    if (id && id !== 'null') {
      return super.remove(id, params);
    } else {
      assert(params.query.collect, 'params.query.collect not provided.');
      assert(params.query.subject, 'query.subject not provided.');

      return super.remove(null, {
        query: {
          subject: { $in: params.query.subject.split(',') },
          collect: params.query.collect,
          user: params.user.id
        },
        provider: params.provider,
        $multi: true
      });
    }
  }

  reorder (id, data, params, original) {
    return this.get(data.target).then((target) => {
      if (!target) throw new Error("data.target not exists");
      target = target.data || target;
      return helpers.reorderPosition(this.Model, original, target.position, { classify: 'collect' });
    });
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'user-collection', ...options };
  return createService(app, UserCollectionService, UserCollectionModel, options);
}

init.Service = UserCollectionService;
