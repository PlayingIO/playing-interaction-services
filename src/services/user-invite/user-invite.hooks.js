const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');
const { sanitize, validate } = require('mostly-feathers-validate');

const accepts = require('./user-invite.accepts');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      patch: [
        sanitize(accepts),
        validate(accepts)
      ],
      remove: [
        sanitize(accepts),
        validate(accepts)
      ]
    },
    after: {
      all: [
        cache(options.cache),
        hooks.responder()
      ]
    }
  };
};