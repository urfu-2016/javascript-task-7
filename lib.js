'use strict';

function getFriendsOfBestFriends(bestFriends) {
    var friendsOfBestFriends = [];

    bestFriends.forEach(function (bestFriend) {
        var newFriends = findNotVisitedFriends(bestFriend.friends, friendsOfBestFriends);
        friendsOfBestFriends = friendsOfBestFriends.concat(newFriends);
    });

    return friendsOfBestFriends;
}

function sortFriends(friendOne, friendTwo) {
    var nameOne = friendOne.name;
    var nameTwo = friendTwo.name;

    if (nameOne === nameTwo) {
        return 0;
    }

    return (nameOne > nameTwo) ? 1 : -1;
}

function findNotVisitedFriends(friends, resource) {
    return friends.filter(function (friend) {
        return !resource.some(function (resourceElement) {
            return resourceElement === friend;
        });
    });
}

function getFriends(friends, filter, maxLevel) {
    maxLevel = (maxLevel !== undefined) ? maxLevel : Infinity;

    var bestFriends = friends.filter(function (friend) {
        return friend.best;
    })
    .sort(sortFriends);

    var _friends = [];

    while (bestFriends.length > 0 && maxLevel > 0) {
        _friends = _friends.concat(bestFriends);

        var nextBestFriends = getFriendsOfBestFriends(bestFriends).map(function (name) {
            return friends.filter(function (friend) {
                return friend.name === name;
            })[0];
        });

        bestFriends = findNotVisitedFriends(nextBestFriends, _friends).sort(sortFriends);

        maxLevel--;
    }

    _friends = _friends.filter(filter.filter);

    return _friends;
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

    this._pointer = 0;
    this._friends = getFriends(friends, filter);
}

Iterator.prototype.done = function () {
    return this._pointer === this._friends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this._friends[this._pointer++];
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
        throw new TypeError();
    }

    this._pointer = 0;
    this._friends = getFriends(friends, filter, maxLevel);
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
* Фильтр друзей-юношей
* @extends Filter
* @constructor
 */
function MaleFilter() {
    this.filter = function (friend) {
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
    this.filter = function (friend) {
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
