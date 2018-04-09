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
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  find (params) {
    params = fp.assign({ query: {} }, params);
    params.query.$sort = params.query.$sort || { position: 1 };

    return super.find(params);
  }

  get (id, params) {
    params = Object.assign({ query: {} }, params);
    assert(params.query.user, 'params.query.user not provided');
    params.query.document = params.query.document || id;
    return this.first(null, null, params);
  }

  create (data, params) {
    assert(data.collect, 'data.collect not provided.');
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.user, 'data.user not provided.');

    const svcDocuments = this.app.service('documents');
    const svcCollections = this.app.service('collections');
    
    const ids = [].concat(data.document || data.documents);

    const getDocuments = () => svcDocuments.find({ query: { _id: { $in: ids } } });
    const getCollection = () => svcCollections.get(data.collect);

    return Promise.all([
      getDocuments(),
      getCollection()
    ]).then(([results, collection]) => {
      const docs = results && results.data || results;
      if (!docs || docs.length !== ids.length) throw new Error('some data.document(s) not exists');
      if (!collection) throw new Error('parent collection not exists');
      return Promise.all(docs.map((doc) => {
        return super.upsert(null, {
          document: doc.id,
          collect: collection.id,
          type: doc.type,
          user: data.user
        });
      }));
    });
  }

  remove (id, params) {
    if (id && id !== 'null') {
      return super.remove(id, params);
    } else {
      assert(params.query.collect, 'params.query.collect not provided.');
      assert(params.query.document, 'query.document not provided.');
      assert(params.query.user, 'query.user not provided.');

      return super.remove(null, {
        query: {
          document: { $in: params.query.document.split(',') },
          collect: params.query.collect,
          user: params.query.user
        },
        provider: params.provider,
        $multi: true
      });
    }
  }

  _reorder (id, data, params, original) {
    return this.get(data.target).then((target) => {
      if (!target) throw new Error("data.target not exists");
      target = target.data || target;
      return helpers.reorderPosition(this.Model, original, target.position, { classify: 'collect' });
    });
  }
}

export default function init (app, options, hooks) {
  options = Object.assign({ ModelName: 'user-collection' }, options);
  return createService(app, UserCollectionService, UserCollectionModel, options);
}

init.Service = UserCollectionService;
