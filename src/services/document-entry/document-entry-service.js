import assert from 'assert';
import makeDebug from 'debug';
import { filter, flatten, groupBy, map, unionWith } from 'lodash';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';
import DocumentEntryModel from '~/models/document-entry-model';
import { populateByService } from 'playing-content-services/lib/helpers';
import defaultHooks from './document-entry-hooks';

const debug = makeDebug('playing:interaction-services:document-entries');

const defaultOptions = {
  name: 'document-entries'
};

class DocumentEntryService extends Service {
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

    return super.find(params).then((results) => {
      let documents = results.data || results;
      if (documents && documents.length > 0) {
        return populateByService(this.app, 'entry', 'type', {
          provider: params.provider,
          headers: params.headers
        })(documents);
      } else {
        return [];
      }
    });
  }

  create(data, params) {
    assert(data.collection, 'data.collection not provided.');
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.owner, 'data.owner not provided.');

    const documents = this.app.service('documents');
    const collections = this.app.service('collections');
    
    const entries = [].concat(data.document || data.documents);

    return Promise.all([
      documents.find({ query: {
        _id: { $in: entries }
      }}),
      collections.get(data.collection),
    ]).then(([results, col]) => {
      let docs = results.data || results;
      if (!docs || docs.length !== entries.length) throw new Error('some data.document not exists');
      if (!col) throw new Error('data.collection not exists');
      return Promise.all(docs.map((doc) => {
        return super.upsert({
          entry: doc.id,
          parent: data.collection,
          type: doc.type,
          owner: data.owner
        });
      }));
    });
  }

  remove(id, params) {
    if (id && id !== 'null') {
      return super.remove(id, params);
    } else {
      assert(params.query.collection, 'query.collection not provided.');
      assert(params.query.document, 'query.document not provided.');
      assert(params.query.owner, 'query.owner not provided.');

      return super.remove(null, {
        query: {
          entry: { $in: params.query.document.split(',') },
          parent: params.query.collection,
          owner: params.query.owner
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
  options = Object.assign({ ModelName: 'document-entry' }, options);
  return createService(app, DocumentEntryService, DocumentEntryModel, options);
}

init.Service = DocumentEntryService;
