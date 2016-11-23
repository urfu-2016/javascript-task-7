'use strict';

function friendsSelect(friends, filter, maxLevel) {
    var invitedFriends = [];
    var uninvitedFriends = {};
    var level = friends.reduce(function (newLevel, friend) {
        if (friend.best) {
            newLevel.current.push(friend);
            newLevel.next = newLevel.next.concat(friend.friends);
        } else {
            uninvitedFriends[friend.name] = friend;
        }

        return newLevel;
    }, { current: [], next: [] });
    while (level.current.length > 0 && maxLevel-- > 0) {
        invitedFriends = invitedFriends.concat(
            level.current.sort(function (first, second) {
                return first.name.localeCompare(second.name);
            })
        );

        level = level.next.reduce(function (newLevel, name) {
            var friend = uninvitedFriends[name];
            if (friend) {
                newLevel.current.push(friend);
                newLevel.next = newLevel.next.concat(friend.friends);
                delete uninvitedFriends[name];
            }

            return newLevel;
        }, { current: [], next: [] });
    }

    return invitedFriends.filter(function (friend) {
        return filter.call(friend);
    });
}

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

    this._friends = friendsSelect(friends, filter, Infinity);
}

Iterator.prototype.done = function () {
    return this._friends.length === 0;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this._friends.shift();
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
    if (!(filter instanceof Filter)) {
        throw new TypeError('\'filter\' not a Filter()');
    }

    this._friends = friendsSelect(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor4
 */
function Filter() {
    this._rule = function () {
        return true;
    };
}

Filter.prototype.call = function (friends) {
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
