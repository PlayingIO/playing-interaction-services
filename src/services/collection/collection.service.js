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
}

export default function init (app, options, hooks) {
  options = { ModelName: 'collection', ...options };
  return createService(app, CollectionService, CollectionModel, options);
}

init.Service = CollectionService;
