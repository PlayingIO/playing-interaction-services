import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import CollectionModel from '../../models/collection.model';
import defaultHooks from './collection.hooks';

const debug = makeDebug('playing:interaction-services:collections');

const defaultOptions = {
  name: 'collections'
};

export class CollectionService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  /*
   * move/reorder items in the collection
   */
  async move (id, data, params) {
    const collection = params.collection;
    assert(collection, 'collection is not exists');
    assert(data.select, 'data.select is not provided.');
    assert(data.target, 'data.target is not provided.');

    const svcUserCollections = this.app.service('user-collections');

    const [select, target] = await Promise.all(
      [data.select, data.target].map(item => {
        return svcUserCollections.get(null, {
          query: { subject: item, collect: collection.id },
          user: params.user
        });
      })
    );
    debug('move collection member', select, target);
    if (!select) throw new Error('data.select document not exists.');
    if (!target) throw new Error('data.target document not exists.');
    await svcUserCollections.action('reorder').patch(select.id, {
      target: target.id
    });
    return collection;
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'collection', ...options };
  return createService(app, CollectionService, CollectionModel, options);
}

init.Service = CollectionService;
