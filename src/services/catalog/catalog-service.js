import assert from 'assert';
import makeDebug from 'debug';
import { filter, flatten, groupBy, map, unionWith } from 'lodash';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';
import CatalogModel from '~/models/catalog-model';
import defaultHooks from './catalog-hooks';

const debug = makeDebug('playing:interaction-services:catalogs');

const defaultOptions = {
  name: 'catalogs'
};

class CatalogService extends Service {
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

  create(data, params) {
    debug('create', data, params);
    assert(data.parent, 'data.parent not provided.');
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.creator, 'data.creator not provided.');

    const documents = this.app.service('documents');
    
    const ids = [].concat(data.document || data.documents);

    const getDocuments = documents.find({ query: { _id: { $in: ids } } });
    const getCollection = documents.get(data.parent);

    return Promise.all([getDocuments, getCollection]).then(([results, parent]) => {
      const docs = results.data || results;
      if (!docs || docs.length !== ids.length) throw new Error('some data.document not exists');
      if (!parent) throw new Error('parent collection not exists');
      const category = parent.type;
      return Promise.all(docs.map((doc) => {
        return super.upsert({
          document: doc.id,
          parent: parent.id,
          type: doc.type,
          category: category,
          creator: data.creator
        });
      }));
    });
  }

  remove(id, params) {
    if (id && id !== 'null') {
      return super.remove(id, params);
    } else {
      assert(params.query.parent, 'query.parent not provided.');
      assert(params.query.document, 'query.document not provided.');
      assert(params.query.creator, 'query.creator not provided.');

      return super.remove(null, {
        query: {
          document: { $in: params.query.document.split(',') },
          parent: params.query.parent,
          creator: params.query.creator
        },
        provider: params.provider,
        $multi: true
      });
    }
  }

  reorder(id, data, params, original) {
    return this.get(data.target).then((target) => {
      if (!target) throw new Error("data.target not exists");
      target = target.data || target;
      return helpers.reorderPosition(this.Model, original, target.position, { classify: 'parent' });
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'catalog' }, options);
  return createService(app, CatalogService, CatalogModel, options);
}

init.Service = CatalogService;
