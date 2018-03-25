import makeDebug from 'debug';
import fp from 'mostly-func';

const debug = makeDebug('playing:interaction-services:favorite:events');

const createActivity = async function (app, favorite, verb, message) {
  const svcFeeds = app.service('feeds');
  const svcActivities = app.service('activities');
  const svcDocuments = app.service('documents');

  const feed = svcFeeds.get(`document:${favorite.document}`);
  if (feed) {
    await svcActivities.create({
      feed: feed.id,
      actor: `user:${favorite.user}`,
      verb: verb,
      object: `document:${favorite.document}`,
      foreignId: `favorite:${favorite.id}`,
      message: message,
      cc: [`user:${favorite.user}`]
    });
  }
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
      createActivity(app, favorite, 'addedToFavorites', 'favorite the document');
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
      createActivity(app, favorite, 'removeFromFavorites', 'unfavorite the document');
    }
  });
}
