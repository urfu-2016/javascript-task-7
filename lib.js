'use strict';

function isFriendInArrayWithLevels(friendsWithLevels, friend) {
    return friendsWithLevels.map(function (friendWithLevel) {
        return friendWithLevel.friend;
    }).indexOf(friend) !== -1;
}

function getNextLevel(friendFromName, currentResult, names) {
    return names.filter(function (name) {
        return !isFriendInArrayWithLevels(currentResult, friendFromName[name]);
    })
    .map(function (name) {
        return friendFromName[name];
    });
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function getFriendsWithLevels(friends) {
    var friendFromName = {};
    friends.forEach(function (friend) {
        friendFromName[friend.name] = friend;
    });

    var result = [];
    var currentLevel = friends.filter(function (friend) {
        return friend.best;
    });
    var currentLevelIndex = 1;

    while (currentLevel.length !== 0) {
        var nextLevelNames = [];
        for (var i = 0; i < currentLevel.length; i++) {
            result.push({
                'friend': currentLevel[i],
                'level': currentLevelIndex
            });
            nextLevelNames = nextLevelNames.concat(currentLevel[i].friends);
        }
        currentLevelIndex++;
        currentLevel = getNextLevel(friendFromName, result, nextLevelNames.filter(onlyUnique));
    }

    return result;
}

function friendComparer(friendWithLevel, otherFriendWithLevel) {
    if (friendWithLevel.level !== otherFriendWithLevel.level) {
        return Math.sign(friendWithLevel.level - otherFriendWithLevel.level);
    }

    return friendWithLevel.friend.name.localeCompare(otherFriendWithLevel.friend.name);
}

function applyFilter(friendsWithLevels, filter) {
    return friendsWithLevels.filter(function (friendWithLevel) {
        return filter.isFit(friendWithLevel);
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
        throw new TypeError('Вторым аргументом ожидался фильтр');
    }

    this.currentIndex = 0;

    this.friendsWithLevels = applyFilter(getFriendsWithLevels(friends), filter)
        .sort(friendComparer);
}

Iterator.prototype.next = function () {
    if (this.done()) {
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
    var limitFilter = new LimitFilter(maxLevel);

    this.friendsWithLevels = applyFilter(this.friendsWithLevels, limitFilter);
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
    this.isFit = function (friendWithLevel) {
        return friendWithLevel.friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isFit = function (friendWithLevel) {
        return friendWithLevel.friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

function LimitFilter(maxLevel) {
    this.maxLevel = maxLevel;

    this.isFit = function (friendWithLevel) {
        return friendWithLevel.level <= this.maxLevel;
    };
}

LimitFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
