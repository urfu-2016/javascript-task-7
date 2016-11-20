'use strict';

function friendsLevel(friends) {
    var friendsWithLevel = [];

    friends.forEach(function (friend) {
        if (friend.hasOwnProperty('best')) {
            friendsWithLevel.push(
                {
                    friend: friend,
                    level: 1
                }
            );
        } else {
            var minLevel = Infinity;
            friend.friends.forEach(function (connectedFriend) {
                var friendsName = friendsWithLevel.filter(function (friendWithLevel) {
                    return friendWithLevel.friend.name === connectedFriend;
                });
                if (friendsName.length > 0 && minLevel > friendsName[0].level) {
                    minLevel = friendsName[0].level + 1;
                }
            });
            if (minLevel !== Infinity) {
                friendsWithLevel.push(
                    {
                        friend: friend,
                        level: minLevel
                    }
                );
            }
        }
    });

    friendsWithLevel.sort(function (friendOne, friendTwo) {
        if (friendOne.level > friendTwo.level) {
            return 1;
        }
        if (friendOne.level < friendTwo.level) {
            return -1;
        }
        if (friendOne.friend.name > friendTwo.friend.name) {
            return 1;
        }

        return -1;
    });

    return friendsWithLevel;
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
    this.friendsWithLevel = friendsLevel(friends).filter(function (friend) {
        return filter.condition(friend.friend);
    });

    this.currentFriend = 0;
}

Iterator.prototype.next = function () {
    if (this.currentFriend === this.friendsWithLevel.length) {
        return null;
    }

    return this.friendsWithLevel[this.currentFriend++].friend;
};

Iterator.prototype.done = function () {
    return this.currentFriend >= this.friendsWithLevel.length;
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
    this.friendsWithLevel = this.friendsWithLevel.filter(function (friend) {
        return maxLevel >= friend.level;
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.condition = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.condition = function (friend) {
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
    this.condition = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
