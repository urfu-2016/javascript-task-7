'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }

    var friendsMap = {};
    var visited = {};

    function getFriendsFor(currentLevelFriends) {
        var nextLevelFriends = [];
        currentLevelFriends.forEach(function (friend) {
            friend.friends.forEach(function (personsFriend) {
                if (!visited[personsFriend]) {
                    visited[personsFriend] = true;
                    nextLevelFriends.push(friendsMap[personsFriend]);
                }
            });
        });

        return nextLevelFriends;
    }

    this._getLevels = function (limitLevels, maxLevel) {
        maxLevel = maxLevel > 0 ? maxLevel : 0;

        var bestFriends = [];
        friends.forEach(function (friend) {
            friendsMap[friend.name] = friend;
            visited[friend.name] = friend.best;
            if (friend.best) {
                bestFriends.push(friend);
            }
        });

        var levels = [];
        for (var level = bestFriends; level.length !== 0; level = getFriendsFor(level)) {
            levels.push(level);
        }

        if (limitLevels && levels.length > maxLevel) {
            levels.length = maxLevel;
        }

        return levels
            .map(function (lvl) {
                return lvl
                    .filter(filter.isSuitable)
                    .sort(function (a, b) {
                        return a.name > b.name ? 1 : -1;
                    });
            })
            .reduce(function (acc, lvl) {
                return acc.concat(lvl);
            }, []);
    };

    this.done = function () {
        return this._currentFriend === this._friends.length;
    };

    this.next = function () {
        return this.done() ? null : this._friends[this._currentFriend++];
    };

    this._friends = this._getLevels();
    this._currentFriend = 0;
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);

    this._friends = this._getLevels(true, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isSuitable = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isSuitable = function (person) {
        return person.gender === 'male';
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
    this.isSuitable = function (person) {
        return person.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
