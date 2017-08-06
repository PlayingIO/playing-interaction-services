import makeDebug from 'debug';
import fp from 'ramda';

const debug = makeDebug('playing:interaction-services:activities:subscriptions:document-events');

export function subFavoriteEvents(app, options) {
  const feeds = app.service('feeds');
  const activities = app.service('activities');
  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'favorite.added'
  }, (resp) => {
    const favorite = resp.event;
    const creator = favorite && favorite.creator;
    debug('favorite.added', favorite);
    if (favorite && creator) {
      return fp.map((document) => {
        feeds.get(`document:${document.id}`).then((feed) => {
          if (feed) {
            activities.create({
              feed: feed.id,
              actor: `user:${creator.id}`,
              verb: 'addedToFavorites',
              object: `document:${document.id}`,
              foreignId: `favorite:${favorite.id}`,
              message: 'favorite the document',
              cc: [`user:${creator.id}`]
            });
          }
        });
      }, [].concat(favorite.entry));
    }
  });
}

export function subUnFavoriteEvents(app, options) {
  const feeds = app.service('feeds');
  const activities = app.service('activities');
  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'favorite.removed'
  }, (resp) => {
    const favorite = resp.event;
    const creator = favorite && favorite.creator;
    debug('favorite.removed', favorite);
    if (favorite && creator) {
      return fp.map((document) => {
        feeds.get(`document:${document.id}`).then((feed) => {
          if (feed) {
            activities.create({
              feed: feed.id,
              actor: `user:${creator.id}`,
              verb: 'removeFromFavorites',
              object: `document:${document.id}`,
              foreignId: `favorite:${favorite.id}`,
              message: 'unfavorite the document',
              cc: [`user:${creator.id}`]
            });
          }
        });
      }, [].concat(favorite.entry));
    }
  });
}
