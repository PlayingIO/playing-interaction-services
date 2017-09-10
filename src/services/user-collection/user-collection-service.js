import assert from 'assert';
import makeDebug from 'debug';
import { filter, flatten, groupBy, map, unionWith } from 'lodash';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';
import UserCollectionModel from '~/models/user-collection-model';
import defaultHooks from './user-collection-hooks';

const debug = makeDebug('playing:interaction-services:user-collections');

const defaultOptions = {
  name: 'user-collections'
};

class UserCollectionService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  find(params) {
    params = params || { query: {} };
    params.query.$sort = params.query.$sort || { position: 1 };

    return super.find(params);
  }

  get(id, params) {
    params = Object.assign({ query: {} }, params);
    params.query.document = params.query.document || id;
    return super.first(params);
  }

  create(data, params) {
    assert(data.collect, 'data.collect not provided.');
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.user, 'data.user not provided.');

    const documents = this.app.service('documents');
    const collections = this.app.service('collections');
    
    const ids = [].concat(data.document || data.documents);

    const getDocuments = documents.find({ query: { _id: { $in: ids } } });
    const getCollection = collections.get(data.collect);

    return Promise.all([getDocuments, getCollection]).then(([results, collection]) => {
      const docs = results.data || results;
      if (!docs || docs.length !== ids.length) throw new Error('some data.document not exists');
      if (!collection) throw new Error('parent collection not exists');
      return Promise.all(docs.map((doc) => {
        return super.upsert({
          document: doc.id,
          collect: collection.id,
          type: doc.type,
          user: data.user
        });
      }));
    });
  }

  remove(id, params) {
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

  _reorder(id, data, params, original) {
    return this.get(data.target).then((target) => {
      if (!target) throw new Error("data.target not exists");
      target = target.data || target;
      return helpers.reorderPosition(this.Model, original, target.position, { classify: 'collect' });
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'user-collection' }, options);
  return createService(app, UserCollectionService, UserCollectionModel, options);
}

init.Service = UserCollectionService;