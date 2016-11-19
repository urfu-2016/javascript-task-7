'use strict';

function compareFriends(one, another) {
    if (one.level !== another.level) {
        return one.level > another.level ? 1 : -1;
    }

    return one.friend.name > another.friend.name ? 1 : -1;
}

function getFriendsWithLevels(friends) {
    var friendsWithLevel = friends.map(function (friend) {
        return {
            friend: friend,
            level: friend.best ? 1 : 0
        };
    });
    var currentLevelFriends = friendsWithLevel.filter(function (friendWithLevel) {
        return friendWithLevel.friend.best || false;
    });
    var nameToFriend = friendsWithLevel.reduce(function (result, friendWithLevel) {
        result[friendWithLevel.friend.name] = friendWithLevel;

        return result;
    }, {});

    while (currentLevelFriends.length > 0) {
        currentLevelFriends = currentLevelFriends.reduce(
            function (nextLevelFriends, friendWithLevel) {
                var nextLevel = friendWithLevel.level + 1;

                friendWithLevel.friend.friends.forEach(function (friendName) {
                    var friendsFriend = nameToFriend[friendName];

                    if (!friendsFriend.level) {
                        friendsFriend.level = nextLevel;
                        nextLevelFriends.push(friendsFriend);
                    }
                });

                return nextLevelFriends;
            }, []);
    }

    return friendsWithLevel.filter(function (friendWithLevel) {
        return friendWithLevel.level > 0;
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

    this._friendsWithLevel = getFriendsWithLevels(friends)
        .filter(function (friendWithLevel) {
            return filter.apply(friendWithLevel.friend);
        })
        .sort(compareFriends);
    this._currentIndex = 0;
}

Iterator.prototype.done = function () {
    return this._currentIndex === this._friendsWithLevel.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this._friendsWithLevel[this._currentIndex++].friend;
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
    Iterator.call(this, friends, filter);

    this._friendsWithLevel = this._friendsWithLevel.filter(function (friendWithLevel) {
        return friendWithLevel.level <= maxLevel;
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this._filters = [];
}

Filter.prototype.apply = function () {
    var args = arguments;

    return this._filters.every(function (filter) {
        return filter.apply(null, args);
    });
};

function isMale(friend) {
    return friend.gender === 'male';
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Filter.call(this);

    this._filters.push(isMale);
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

function isFemale(friend) {
    return friend.gender === 'female';
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Filter.call(this);

    this._filters.push(isFemale);
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
