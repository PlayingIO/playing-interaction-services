import assert from 'assert';
import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';
import { helpers as feeds } from 'playing-feed-services';

export default function (event) {
  return context => {
    const svcDocuments = context.app.service('documents');

    const createActivity = async function (result, verb, message) {
      const document = await svcDocuments.get(result.document);
      assert(document, 'favorite.document is not exists');

      const activity = {
        actor: `user:${result.user}`,
        verb: verb,
        object: `${document.type}:${document.id}`,
        foreignId: `favorite:${result.id}`,
        message: message
      };

      await feeds.addActivity(context.app, activity,
        `user:${result.user}`,             // add to actor's activity log
        `${document.type}:${document.id}`, // add to document's activity log
        `notification:${document.creator}` // add to document author's notification stream
      );
    };

    const results = helpers.getHookDataAsArray(context);
    switch (event) {
      case 'favorite.create':
        Promise.all(fp.map(favorite =>
          createActivity(favorite, event, 'Favorite the document'), results));
        break;
      case 'favorite.delete':
        Promise.all(fp.map(favorite =>
          createActivity(favorite, event, 'Unfavorite the document'), results));
        break;
    }
  };
}
