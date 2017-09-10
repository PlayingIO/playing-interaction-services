import assert from 'assert';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { discard, iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import * as content from 'playing-content-services/lib/services/content-hooks';
import CollectionEntity from '~/entities/collection-entity';

const addCollectionEnrichers = (options) => (hook) => {
  assert(hook.type === 'after', `addCollectionMetadata must be used as a 'after' hook.`);

  // If no enrichers-document header then skip this hook
  if (!(hook.params.headers && hook.params.headers['enrichers-document'])) {
    return hook;
  }

  let enrichers = hook.params.headers['enrichers-document'].split(',').map(e => e.trim());
  let results = [].concat(hook.result? hook.result.data || hook.result : []);
  
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
        auth.authenticate('jwt')
      ],
      get: [
        queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      find: [
        queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        content.computePath()
      ],
      update: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('parent'),
        content.computePath(),
        discard('id', 'metadata', 'creator', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      patch: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('parent'),
        content.computePath(),
        discard('id', 'metadata', 'creator', 'createdAt', 'updatedAt', 'destroyedAt')
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'documents', fallThrough: ['headers'] }),
        hooks.populate('creator', { service: 'users' }),
        content.documentEnrichers(options),
        addCollectionEnrichers(options),
        hooks.presentEntity(CollectionEntity, options),
        iff(isProvider('external'), discard('ACL')),
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