import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

const debug = makeDebug('playing:interaction-services:favorite:events');

const createActivity = async function (app, favorite, verb, message) {
  const svcFeeds = app.service('feeds');
  const svcDocuments = app.service('documents');

  const document = await svcDocuments.get(favorite.document);
  assert(document, 'favorite.document is not exists');

  const activity = {
    actor: `user:${favorite.user}`,
    verb: verb,
    object: `${document.type}:${favorite.document}`,
    foreignId: `favorite:${favorite.id}`,
    message: message,
    cc: [`user:${favorite.user}`]
  };

  // add to document's activity log
  await svcFeeds.action('addActivity').patch(`document:${favorite.document}`, activity);
};

export default function (app, options) {
  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'favorite.added'
  }, (resp) => {
    const favorite = resp.event;
    debug('favorite.added', favorite);
    if (favorite) {
      createActivity(app, favorite, 'favorites.added', 'favorite the document');
    }
  });

  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'favorite.removed'
  }, (resp) => {
    const favorite = resp.event;
    debug('favorite.removed', favorite);
    if (favorite) {
      createActivity(app, favorite, 'favorites.removed', 'unfavorite the document');
    }
  });
}
