'use strict';

function compareFriends(one, another) {
    if (one.level > another.level) {
        return 1;
    }
    if (one.level < another.level) {
        return -1;
    }

    return one.friend.name > another.friend.name ? 1 : -1;
}

function getFriendsIterable(friends) {
    var friendsWithLevel = friends.map(function (friend) {
        return {
            friend: friend,
            level: 0
        };
    });
    var currentCollection = friendsWithLevel.filter(function (friendWithLevel) {
        return friendWithLevel.friend.best;
    });
    var names = friends.map(function (friend) {
        return friend.name;
    });
    var result = [];
    var currentLevel = 1;

    while (currentCollection.length > 0) {
        for (var i = 0; i < currentCollection.length; i++) {
            result.push(currentCollection[i]);
            currentCollection[i].level = currentLevel;
        }

        currentCollection = currentCollection.reduce(function (nextLevelFriends, friendWithLevel) {
            friendWithLevel.friend.friends.forEach(function (friendName) {
                var friendsFriend = friendsWithLevel[names.indexOf(friendName)];
                if (!friendsFriend.level) {
                    nextLevelFriends.push(friendsFriend);
                }
            });

            return nextLevelFriends;
        }, []);
        currentLevel++;
    }

    return result;
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

    this.friendsWithLevel = getFriendsIterable(friends)
        .filter(function (friendWithLevel) {
            return filter.check(friendWithLevel.friend);
        })
        .sort(compareFriends);
    this.currentIndex = 0;
}

Iterator.prototype.done = function () {
    return this.currentIndex === this.friendsWithLevel.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.friendsWithLevel[this.currentIndex++].friend;
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

    this.friendsWithLevel = this.friendsWithLevel.filter(function (friendWithLevel) {
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
    this.filters = [];
}

Filter.prototype.check = function () {
    var args = arguments;

    return this.filters.every(function (filter) {
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

    this.filters.push(isMale);
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

    this.filters.push(isFemale);
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
