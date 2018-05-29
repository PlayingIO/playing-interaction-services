import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';
import feeds from 'playing-feed-common';

import defaultHooks from './user-request.hooks';

const debug = makeDebug('playing:interaction-services:users/requests');

const defaultOptions = {
  name: 'users/requests',
  requests: [
    'mission.join.request',
    'mission.roles.request',
    'team.join.request',
    'team.roles.request'
  ]
};

export class UserRequestService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * List pending pending requests to join teams/missions for the player
   */
  async find (params) {
    const svcFeedsActivities = this.app.service('feeds/activities');
    const requests = this.options.requests;
    return svcFeedsActivities.find({
      primary: `user:${params.user.id}`,
      query: {
        verb: { $in: requests },
        state: 'PENDING',
        ...params.query
      }
    });
  }

  /**
   * Cancel a request
   */
  async remove (id, params) {
    // check for pending request sent by current user
    const feed = `user:${params.user.id}`;
    const activity = await feeds.getPendingActivity(this.app, feed, id);
    if (!activity) {
      throw new Error('No pending request is found for this request id.');
    }
    switch (activity.verb) {
      case 'mission.join.request':
      case 'mission.roles.request':
        return this.app.service('user-missions/approvals').remove(activity.id, {
          primary: helpers.getId(activity.object),
          user: params.user
        });
      case 'team.join.request':
      case 'team.roles.request':
        return this.app.service('teams/approvals').remove(activity.id, {
          primary: helpers.getId(activity.object),
          user: params.user
        });
      default:
        throw new Error(`Unkown activity verb: ${activity.verb}`);
    }
  }
}

export default function init (app, options, hooks) {
  return new UserRequestService(options);
}

init.Service = UserRequestService;
