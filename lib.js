'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!filter || !Filter.prototype.isPrototypeOf(filter)) {
        throw new TypeError('filter must be instance of Filter');
    }

    this.collection = [];
    this.curIndex = 0;

    this.buildCollection(friends, filter, Infinity);
}

Iterator.prototype.done = function () {
    return this.curIndex === this.collection.length;
};

Iterator.prototype.next = function () {
    return this.curIndex === this.collection.length ? null : this.collection[this.curIndex++];
};

Iterator.prototype.buildCollection = function (friends, filter, maxLevel) {
    var lastLevel = friends.filter(isBestFriend).sort(compareByName);
    this.collection = lastLevel.filter(filter.apply);

    var visited = lastLevel;

    for (var level = 2; level <= maxLevel; level++) {
        lastLevel = this.getNextLevel(lastLevel, friends, visited);
        if (lastLevel.length === 0) {
            break;
        }
        this.collection = this.collection.concat(lastLevel.filter(filter.apply));
    }
};

Iterator.prototype.getNextLevel = function (lastLevel, friends, visited) {
    var curLevel = [];

    lastLevel.forEach(function (lastLevelFriend) {
        lastLevelFriend.friends.forEach(function (friendName) {
            var curFriend = friends.find(function (friend) {
                return friend.name === friendName;
            });

            if (visited.indexOf(curFriend) === -1) {
                curLevel.push(curFriend);
                visited.push(curFriend);
            }
        });
    });

    return curLevel.sort(compareByName);
};

function isBestFriend(friend) {
    return friend.best === true;
}

function compareByName(a, b) {
    return a.name.localeCompare(b.name);
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
    if (!filter || !Filter.prototype.isPrototypeOf(filter)) {
        throw new TypeError('filter must be instance of Filter');
    }

    this.collection = [];
    this.curIndex = 0;

    this.buildCollection(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.apply = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.apply = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.apply = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
