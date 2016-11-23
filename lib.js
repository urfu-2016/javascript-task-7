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
    this._maxLevel = isNaN(arguments[2]) ? Infinity : arguments[2];
    this._init(friends, filter);
}

Iterator.prototype._init = function friendsSelect(friends, filter) {
    var invitedFriends = [];
    var uninvitedFriends = {};
    var currentFriends = friends.reduce(function (newFriends, friend) {
        if (friend.best) {
            newFriends.persons.push(friend);
            newFriends.friends = newFriends.friends.concat(friend.friends);
        } else {
            uninvitedFriends[friend.name] = friend;
        }

        return newFriends;
    }, { persons: [], friends: [] });
    while (currentFriends.persons.length > 0 && this._maxLevel-- > 0) {
        invitedFriends = invitedFriends.concat(
            currentFriends.persons.sort(function (first, second) {
                return first.name.localeCompare(second.name);
            })
        );

        currentFriends = currentFriends.friends.reduce(function (newFriends, name) {
            var friend = uninvitedFriends[name];
            if (friend) {
                newFriends.persons.push(friend);
                newFriends.friends = newFriends.friends.concat(friend.friends);
                delete uninvitedFriends[name];
            }

            return newFriends;
        }, { persons: [], friends: [] });
    }

    this._friends = invitedFriends.filter(function (friend) {
        return filter.call(friend);
    });
};

Iterator.prototype.done = function () {
    return this._friends.length === 0;
};

Iterator.prototype.friends = function () {
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
    Iterator.call(this, friends, filter, maxLevel);
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
