'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter must be instance of Filter');
    }

    this.curIndex = 0;

    this.buildCollection(friends, filter, Infinity);
}

Iterator.prototype.done = function () {
    return this.curIndex === this.collection.length;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.collection[this.curIndex++];
};

Iterator.prototype.buildCollection = function (friends, filter, maxLevel) {
    this.collection = [];

    if (!maxLevel || maxLevel < 1) {
        return;
    }

    var lastLevel = friends.filter(isBestFriend).sort(compareByName);
    this.collection = lastLevel.filter(filter.comply);

    var visited = lastLevel.reduce(function (collection, friend) {
        collection[friend.name] = true;

        return collection;
    }, {});

    var friendsByName = friends.reduce(function (collection, friend) {
        collection[friend.name] = friend;

        return collection;
    }, {});

    for (var level = 2; level <= maxLevel && lastLevel.length !== 0; level++) {
        lastLevel = this.getNextLevel(lastLevel, friendsByName, visited);
        this.collection = this.collection.concat(lastLevel.filter(filter.comply));
    }
};

Iterator.prototype.getNextLevel = function (lastLevel, friendsByName, visited) {
    var curLevel = [];

    lastLevel.forEach(function (lastLevelFriend) {
        lastLevelFriend.friends.forEach(function (friendName) {
            var curFriend = friendsByName[friendName];

            if (!visited[curFriend.name]) {
                curLevel.push(curFriend);
                visited[curFriend.name] = true;
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
    Iterator.call(this, [], filter);
    this.buildCollection(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.comply = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.comply = function (friend) {
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
    this.comply = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
