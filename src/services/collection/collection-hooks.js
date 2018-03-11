import assert from 'assert';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { hooks as content } from 'playing-content-services';
import CollectionEntity from '~/entities/collection-entity';

const addCollectionEnrichers = (options) => (hook) => {
  assert(hook.type === 'after', `addCollectionMetadata must be used as a 'after' hook.`);

  // If no enrichers-document header then skip this hook
  if (!(hook.params.headers && hook.params.headers['enrichers-document'])) {
    return hook;
  }

  let enrichers = hook.params.headers['enrichers-document'].split(',').map(e => e.trim());
  let results = [].concat(hook.result && hook.result.data || hook.result || []);
  
  if (enrichers.indexOf('permissions') > -1) {
    results.forEach((doc) => {
      doc.metadata = doc.metadata || {};
      doc.metadata.permissions = doc.metadata.permissions || [];
      doc.metadata.permissions.push('ReadCanCollect');
    });
  }
  return hook;
};

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt'),
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'creator' }))
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        content.computePath({ type: 'collection' })
      ],
      update: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('id', 'metadata', 'ancestors', 'creator', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath({ type: 'collection' }),
        content.computeAncestors()
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('id', 'metadata', 'ancestors', 'creator', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath({ type: 'collection' }),
        content.computeAncestors()
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'documents', fallThrough: ['headers'] }),
        hooks.populate('ancestors'), // with typed id
        hooks.populate('creator', { service: 'users' }),
        content.documentEnrichers(options),
        addCollectionEnrichers(options),
        hooks.presentEntity(CollectionEntity, options),
        iff(isProvider('external'), hooks.discardFields('ACL')),
        hooks.responder()
      ],
      find: [
        hooks.assoc('documents', { service: 'user-collections', field: 'collect' })
      ],
      create: [
        hooks.publishEvent('document.create', { prefix: 'playing' })
      ]
    }
  };
};