'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!Filter.prototype.isPrototypeOf(filter)) {
        throw new TypeError('Wrong type of filter. It must be Filter');
    }
    this.friendsWithLevel = this.friendsLevel(friends).filter(function (friend) {
        return filter.condition(friend.friend);
    });

    this.currentFriend = 0;
}

Iterator.prototype.friendsLevel = function (friends) {

    var bestFriends = friends.filter(function (friend) {
        return friend.hasOwnProperty('best') && friend.best;
    });

    var namesOfFriends = [];
    var friendsWithLevel = [];
    bestFriends.forEach(function (friend) {
        namesOfFriends.push(friend.name);
        friendsWithLevel.push(
            {
                friend: friend,
                level: 1
            }
        );
    });

    for (var i = 0; i < friendsWithLevel.length; i++) {
        var newLevelFriends =
        friendsWithLevel[i].friend.friends.reduce(function (newLevelFunction, friendName) {
            if (namesOfFriends.indexOf(friendName) === -1) {
                var friendToPush = friends.filter(function (friend) {
                    return friend.name === friendName;
                });
                newLevelFunction = newLevelFunction.concat(friendToPush);
            }

            return newLevelFunction;
        }, []);
        for (var j = 0; j < newLevelFriends.length; j++) {
            friendsWithLevel.push(
                {
                    friend: newLevelFriends[j],
                    level: friendsWithLevel[i].level + 1
                }
            );
            namesOfFriends.push(newLevelFriends[j].name);
        }
    }

    friendsWithLevel.sort(function (friendOne, friendTwo) {
        if (friendOne.level > friendTwo.level) {
            return 1;
        }
        if (friendOne.level < friendTwo.level) {
            return -1;
        }

        return (friendOne.friend.name > friendTwo.friend.name) ? 1 : -1;
    });

    return friendsWithLevel;
};


Iterator.prototype.next = function () {
    if (this.currentFriend === this.friendsWithLevel.length) {
        return null;
    }

    return this.friendsWithLevel[this.currentFriend++].friend;
};

Iterator.prototype.done = function () {
    return this.currentFriend === this.friendsWithLevel.length;
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
