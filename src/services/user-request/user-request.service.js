const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-mongoose');
const feeds = require('playing-feed-common');

const defaultHooks = require('./user-request.hooks');

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

class UserRequestService {
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

module.exports = function init (app, options, hooks) {
  return new UserRequestService(options);
};
module.exports.Service = UserRequestService;
