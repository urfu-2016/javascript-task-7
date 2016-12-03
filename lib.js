'use strict';

function cloneObject(obj) {
    var copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = clone(obj[attr]);
        }
    }

    return copy;
}

function cloneArray(array) {
    var copy = [];
    for (var i = 0, len = array.length; i < len; i++) {
        copy[i] = clone(array[i]);
    }

    return copy;
}

function clone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Array) {
        return cloneArray(obj);
    }
    if (obj instanceof Object) {
        return cloneObject(obj);
    }
}

function compareFriends(a, b) {
    if (a.level > b.level) {
        return 1;
    } else if (a.level < b.level) {
        return -1;
    }

    return (a.name > b.name) ? 1 : -1;
}

function getFriendsOnNextLevel(friendsOnPreviousLevels, friends, level) {
    var friendsOnNextLevel = friendsOnPreviousLevels.reduce(function (friendsOnLevel, friend) {
        friend.friends.forEach(function (friendOnNextLevel) {
            friendsOnLevel[friendOnNextLevel] = true;
        });

        return friendsOnLevel;
    }, {});

    return Object.keys(friendsOnNextLevel).map(function (nameFriend) {
        return friends.find(function (friend) {
            return friend.name === nameFriend;
        });
    })
    .filter(function (friend) {
        return !friend.level;
    })
    .map(function (friend) {
        friend.level = level;

        return friend;
    });
}

function getFriendsWithLevel(friends, filter, maxLevel) {
    maxLevel = maxLevel || Infinity;
    var currentLevel = 1;
    var friendsOnCurrentLevel = friends.filter(function (friend) {
        return friend.best;
    }).map(function (friend) {
        friend.level = currentLevel;

        return friend;
    });

    var friendsWithLevel = friendsOnCurrentLevel.slice();
    while (friendsOnCurrentLevel.length) {
        friendsOnCurrentLevel = getFriendsOnNextLevel(friendsOnCurrentLevel,
            friends, ++currentLevel);
        friendsWithLevel = friendsWithLevel.concat(friendsOnCurrentLevel);
    }

    return friendsWithLevel.filter(function (friend) {
        return filter.select(friend) && friend.level <= maxLevel;
    }).sort(compareFriends)
    .map(function (friend) {
        delete friend.level;

        return friend;
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
        throw new TypeError();
    }
    this.invitedFriends = getFriendsWithLevel(clone(friends), filter);
    this.pointer = 0;
}

Iterator.prototype.done = function () {
    return this.pointer === this.invitedFriends.length;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.invitedFriends[this.pointer++];
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
        throw new TypeError('Not instance of Filter');
    }
    this.invitedFriends = getFriendsWithLevel(clone(friends), filter, maxLevel);
    this.pointer = 0;
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.select = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.select = function (friend) {
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
    this.select = function (friend) {
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
