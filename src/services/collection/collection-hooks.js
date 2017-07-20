import assert from 'assert';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { discard } from 'feathers-hooks-common';
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
        queryWithCurrentUser({ idField: 'id', as: 'owner' })
      ],
      find: [
        queryWithCurrentUser({ idField: 'id', as: 'owner' })
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'owner' }),
        content.computePath(),
        content.fetchBlobs()
      ],
      update: [
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'owner', 'path', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.fetchBlobs()
      ],
      patch: [
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'owner', 'path', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.fetchBlobs()
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'folders' }),
        hooks.populate('owner', { service: 'users' }),
        hooks.presentEntity(CollectionEntity, options),
        content.documentEnrichers(options),
        addCollectionEnrichers(options),
        hooks.responder()
      ]
    }
  };
};