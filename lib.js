'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!Filter.prototype.isPrototypeOf(filter)) {
        throw new TypeError('filter must be instace of Filter');
    }

    this.collection = [];

    var lastLevel = friends.filter(isBestFriend).sort(compareByName);

    while (lastLevel.filter(filter.apply).length !== 0) {
        this.collection = this.collection.concat(lastLevel.filter(filter.apply));

        lastLevel = this.getNextLevel(lastLevel, friends);
    }

    this.p = 0; // p for pointer :)
}

Iterator.prototype.done = function () {
    return this.p === this.collection.length;
};

Iterator.prototype.next = function () {
    return this.p === this.collection.length ? null : this.collection[this.p++];
};

Iterator.prototype.getNextLevel = function (lastLevel, friends) {
    var curLevel = [];

    lastLevel.forEach(function (lastLevelFriend) {
        lastLevelFriend.friends.forEach(function (friendName) {
            var curFriend = friends.find(function (friend) {
                return friend.name === friendName;
            });

            if (curLevel.indexOf(curFriend) === -1 && this.collection.indexOf(curFriend) === -1) {
                curLevel.push(curFriend);
            }
        }, this);
    }, this);

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
    if (!Filter.prototype.isPrototypeOf(filter)) {
        throw new TypeError('filter must be instace of Filter');
    }

    this.collection = [];

    var lastLevel = friends.filter(isBestFriend).sort(compareByName);

    for (var level = 2; level <= maxLevel; level++) {
        this.collection = this.collection.concat(lastLevel.filter(filter.apply));

        lastLevel = this.getNextLevel(lastLevel, friends);
    }

    this.collection = this.collection.concat(lastLevel.filter(filter.apply));

    this.p = 0;
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
