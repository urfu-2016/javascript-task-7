'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('\'filter\' not a Filter()');
    }

    this._invitedFriends = [];
    this._uninvitedFriends = {};

    this._init(friends);
    this._inviteFriends();
    this._filtered(filter);
}

Iterator.prototype._init = function (friends) {
    var uninvitedFriends = this._uninvitedFriends;
    this._currentFriends = friends.reduce(function (currentLevel, friend) {
        if (friend.best) {
            currentLevel.persons.push(friend);
            currentLevel.friends = currentLevel.friends.concat(friend.friends);
        } else {
            uninvitedFriends[friend.name] = friend;
        }

        return currentLevel;
    }, { persons: [], friends: [] });
};

Iterator.prototype._inviteFriends = function () {
    while (this._currentFriends.persons.length > 0) {
        this._addInvited(this._currentFriends.persons);
        this._currentFriends = this._getFriendsFriends(this._currentFriends.friends);
    }
};

Iterator.prototype._addInvited = function (friends) {
    this._invitedFriends = this._invitedFriends.concat(
        friends.sort(function (first, second) {
            return first.name.localeCompare(second.name);
        })
    );
};

Iterator.prototype._getFriendsFriends = function (friends) {
    var uninvitedFriends = this._uninvitedFriends;

    return friends.reduce(function (currentLevel, name) {
        var friend = uninvitedFriends[name];
        if (friend) {
            currentLevel.persons.push(friend);
            currentLevel.friends = currentLevel.friends.concat(friend.friends);
            delete uninvitedFriends[name];
        }

        return currentLevel;
    }, { persons: [], friends: [] });
};

Iterator.prototype._filtered = function (filter) {
    this._invitedFriends = this._invitedFriends.filter(function (friend) {
        return filter.check(friend);
    });
};

Iterator.prototype.done = function () {
    return this._invitedFriends.length === 0;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this._invitedFriends.shift();
};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this._maxLevel = maxLevel;
    Iterator.call(this, friends, filter);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype._inviteFriends = function () {
    while (this._currentFriends.persons.length > 0 && this._maxLevel-- > 0) {
        this._addInvited(this._currentFriends.persons);
        this._currentFriends = this._getFriendsFriends(this._currentFriends.friends);
    }
};
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this._rule = function () {
        return true;
    };
}

Filter.prototype.check = function (friends) {
    return this._rule.call(null, friends);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this._rule = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this._rule = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
