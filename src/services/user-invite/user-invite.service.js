const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-mongoose');
const feeds = require('playing-feed-common');

const defaultHooks = require('./user-invite.hooks');

const debug = makeDebug('playing:interaction-services:users/invites');

const defaultOptions = {
  name: 'users/invites',
  invites: [
    'mission.invite',
    'team.invite'
  ]
};

class UserInviteService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * List pending invitations to join teams/missions for current user
   */
  async find (params) {
    const svcFeedsActivities = this.app.service('feeds/activities');
    const invites = this.options.invites;
    return svcFeedsActivities.find({
      primary: `notification:${params.user.id}`,
      query: {
        verb: { $in: invites },
        state: 'PENDING',
        ...params.query
      }
    });
  }

  /**
   * Accept an invite
   */
  async patch (id, data, params) {
    // check for pending invitation in notification of current user
    const notification = `notification:${params.user.id}`;
    const activity = await feeds.getPendingActivity(this.app, notification, id);
    if (!activity) {
      throw new Error('No pending invite is found for this invite id.');
    }
    switch (activity.verb) {
      case 'mission.invite': {
        return this.app.service('user-missions/invites').patch(activity.id, null, {
          primary: helpers.getId(activity.object),
          user: params.user
        });
      }
      case 'team.invite': {
        return this.app.service('teams/invites').patch(activity.id, null, {
          primary: helpers.getId(activity.object),
          user: params.user
        });
      }
      default:
        throw new Error(`Unkown activity verb: ${activity.verb}`);
    }
  }

  /**
   * Reject an invite
   */
  async remove (id, params) {
    // check for pending invitation in notification of current user
    const notification = `notification:${params.user.id}`;
    const activity = await feeds.getPendingActivity(this.app, notification, id);
    if (!activity) {
      throw new Error('No pending invite is found for this invite id.');
    }
    switch (activity.verb) {
      case 'mission.invite':
        return this.app.service('user-missions/invites').remove(activity.id, {
          primary: helpers.getId(activity.object),
          user: params.user,
          action: 'reject'
        });
      case 'team.invite':
        return this.app.service('teams/invites').remove(activity.id, {
          primary: helpers.getId(activity.object),
          user: params.user,
          action: 'reject'
        });
      default:
        throw new Error(`Unkown activity verb: ${activity.verb}`);
    }
  }
}

module.exports = function init (app, options, hooks) {
  return new UserInviteService(options);
};
module.exports.Service = UserInviteService;
