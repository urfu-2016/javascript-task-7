'use strict';

function isFriendInArrayWithLevels(friendsWithLevels, friend) {
    return friendsWithLevels.map(function (friendWithLevel) {
        return friendWithLevel.friend;
    }).indexOf(friend) !== -1;
}

function getNextLevel(friends, currentResult, names) {
    return friends.filter(function (friend) {
        return names.indexOf(friend.name) !== -1 &&
            !isFriendInArrayWithLevels(currentResult, friend);
    });
}

function getFriendsWithLevels(friends) {
    var result = [];
    var currentLevel = friends.filter(function (friend) {
        return friend.best;
    });
    var currentLevelIndex = 1;

    while (currentLevel.length !== 0) {
        var nextLevelNames = [];
        for (var i = 0; i < currentLevel.length; i++) {
            result.push(
                {
                    'friend': currentLevel[i],
                    'level': currentLevelIndex
                });
            nextLevelNames = nextLevelNames.concat(currentLevel[i].friends);
        }
        currentLevelIndex++;
        currentLevel = getNextLevel(friends, result, nextLevelNames);
    }
    result = result.concat(friends.filter(function (friend) {
        return !isFriendInArrayWithLevels(result, friend);
    }).map(function (friend) {
        return {
            'friend': friend,
            'level': Infinity
        };
    }));

    return result;
}

function FriendComparer(friendWithLevel, otherFriendWithLevel) {
    if (friendWithLevel.level > otherFriendWithLevel.level) {
        return 1;
    }
    if (friendWithLevel.level < otherFriendWithLevel.level) {
        return -1;
    }

    if (friendWithLevel.friend.name > otherFriendWithLevel.friend.name) {
        return 1;
    }

    return -1;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!Filter.prototype.isPrototypeOf(filter)) {
        throw new TypeError();
    }
    this.friendsWithLevels = getFriendsWithLevels(friends).filter(function (friendWithLevel) {
        return filter.isFit(friendWithLevel.friend);
    })
    .sort(FriendComparer);
    this.currentIndex = 0;
}

Iterator.prototype.next = function () {
    if (this.currentIndex === this.friendsWithLevels.length) {
        return null;
    }

    return this.friendsWithLevels[this.currentIndex++].friend;
};

Iterator.prototype.done = function () {
    return this.currentIndex === this.friendsWithLevels.length;
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
    this.friendsWithLevels = this.friendsWithLevels.filter(function (friendWithLevel) {
        return maxLevel >= friendWithLevel.level;
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isFit = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isFit = function (friend) {
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
    this.isFit = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
