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

    function getFriends(friendsMap, currentLevelFriends, visited) {
        var nextLevelFriends = [];
        currentLevelFriends.forEach(function (friend) {
            friend.friends.forEach(function (personsFriend) {
                var friendObject = friendsMap[personsFriend];
                if (!visited[personsFriend]) {
                    visited[personsFriend] = true;
                    nextLevelFriends.push(friendObject);
                }
            });
        });

        return nextLevelFriends;
    }

    function getLevels() {
        var friendsMap = {};
        var visited = {};

        friends.forEach(function (person) {
            friendsMap[person.name] = person;
            visited[person.name] = person.best;
        });

        var bestFriends = friends.filter(function (friend) {
            return friend.best;
        });

        var levels = [];
        for (var level = bestFriends; level.length !== 0;
            level = getFriends(friendsMap, level, visited)) {
            levels.push(level);
        }

        return levels.map(function (lvl) {
            return lvl
                .filter(function (person) {
                    return filter.filter(person);
                })
                .sort(function (a, b) {
                    return a.name > b.name ? 1 : -1;
                });
        });
    }

    this._skipEmptyLevels = function () {
        while (!this.done() && this._levels[this._currentLevel].length === 0) {
            this._currentLevel++;
        }
    };

    this.done = function () {
        return this._currentLevel === this._levels.length;
    };

    this.next = function () {
        if (!this.done()) {
            var friend = this._levels[this._currentLevel][this._currentFriend];
            var length = this._levels[this._currentLevel].length;
            this._currentFriend++;
            this._currentLevel += Math.floor(this._currentFriend / length);
            this._currentFriend %= length;

            this._skipEmptyLevels();

            return friend;
        }

        return null;
    };

    this._levels = getLevels();
    this._currentLevel = 0;
    this._currentFriend = 0;

    this._skipEmptyLevels();
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

    this._levels.length = maxLevel;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filter = function (person) {
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
    this.filter = function (person) {
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
