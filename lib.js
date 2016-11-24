'use strict';

function getBestFriends(friends) {
    return friends.filter(function (item) {
        return item.best;
    });
}

function getNextLevelFriends(lastLevelFriends, friendsWithoutLevel) {
    var arrays = lastLevelFriends.map(function (item) {
        return item.friends;
    });
    var nextLevelFriendsNames = arrays.length > 1 ? [].concat.apply([], arrays) : arrays[0];

    return friendsWithoutLevel.filter(function (item) {
        return nextLevelFriendsNames.indexOf(item.name) !== -1;
    });
}

function createFriendsWithLevel(friends, level) {
    return friends.map(function (item) {
        return { 'friend': item, 'level': level };
    });
}

function subtractArrays(arr1, arr2, keyFn) {
    if (!keyFn) {
        keyFn = function (item) {
            return item;
        };
    }
    var arrKeys = arr2.map(function (item) {
        return keyFn(item);
    });

    return arr1.filter(function (item) {
        return arrKeys.indexOf(keyFn(item)) === -1;
    });
}

function divideFriendsOnLevels(bestFriends, friends) {
    var levelsCount = 0;
    var dividedFriends = createFriendsWithLevel(bestFriends, levelsCount);
    var friendsOnLastLevel = bestFriends;

    var getName = function (item) {
        return item.name || item.friend.name;
    };

    var friendsWithoutLevel = subtractArrays(friends, dividedFriends, getName);
    while (friendsWithoutLevel.length > 0 && friendsOnLastLevel.length > 0) {
        levelsCount++;
        friendsOnLastLevel = getNextLevelFriends(friendsOnLastLevel, friendsWithoutLevel);
        dividedFriends = [].concat(dividedFriends, createFriendsWithLevel(friendsOnLastLevel,
            levelsCount));
        friendsWithoutLevel = subtractArrays(friendsWithoutLevel, friendsOnLastLevel, getName);
    }

    return dividedFriends;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw TypeError;
    }
    this.sortedFriends = [];
    var bestFriends = getBestFriends(friends);
    var dividedFriends = divideFriendsOnLevels.call(this, bestFriends, friends);

    var filteredFriends = filter.filter(dividedFriends);

    this.sortedFriends = filteredFriends.sort(function (a, b) {
        return (a.level > b.level || (a.level === b.level && a.friend.name > b.friend.name))
            ? 1 : -1;
    });

    this.index = 0;
}

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.sortedFriends[this.index++].friend;
};

Iterator.prototype.done = function () {
    return this.index >= this.sortedFriends.length;
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
    this.sortedFriends = this.sortedFriends.filter(function (item) {
        return item.level < maxLevel;
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.fieldValues = ['female', 'male'];
}

Filter.prototype.filter = function (array) {
    return array.filter(function (item) {
        return this.fieldValues.indexOf(item.friend.gender) !== -1;
    }, this);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.fieldValues = ['male'];
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.fieldValues = ['female'];
}

MaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
