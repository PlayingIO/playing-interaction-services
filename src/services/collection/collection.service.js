const assert = require('assert');
const makeDebug = require('debug');
const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const CollectionModel = require('../../models/collection.model');
const defaultHooks = require('./collection.hooks');

const debug = makeDebug('playing:interaction-services:collections');

const defaultOptions = {
  name: 'collections'
};

class CollectionService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'collection', ...options };
  return createService(app, CollectionService, CollectionModel, options);
};
module.exports.Service = CollectionService;
