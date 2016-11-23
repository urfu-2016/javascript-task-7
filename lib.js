'use strict';

function clone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    var temp = obj.constructor();
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        temp[key] = clone(obj[key]);
    }

    return temp;
}

function getNextCircle(friends) {
    return friends.reduce(function (nextCircle, friend) {
        nextCircle = nextCircle.concat(friend.friends);

        return nextCircle;
    }, []);
}
function getFriendByName(friendName, friends) {
    var foundFriend = friends.find(function (friend) {
        return friend.name === friendName;
    });

    return clone(foundFriend);
}
function removeExistingFriends(candidates, friendsCircle) {
    return friendsCircle.filter(function (friend) {
        return !candidates.some(function (candidate) {
            return candidate.name === friend.name;
        });
    });
}
function compare(a, b) {
    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    }

    return 0;
}
function getCandidate(friends) {
    var currentFriendsCircle = friends.filter(function (friend) {
        return friend.hasOwnProperty('best');
    });
    var candidates = [];
    var currentLevel = 1;
    while (currentFriendsCircle.length > 0) {
        currentFriendsCircle = currentFriendsCircle.sort(function (a, b) {
            return compare(a.name, b.name);
        });
        for (var i = 0; i < currentFriendsCircle.length; i++) {
            currentFriendsCircle[i].level = currentLevel;
        }
        currentFriendsCircle = removeExistingFriends(candidates, currentFriendsCircle);
        candidates = candidates.concat(currentFriendsCircle);
        currentFriendsCircle = getNextCircle(currentFriendsCircle)
        .map(function (name) {
            return getFriendByName(name, friends);
        });
        currentLevel++;
    }

    return candidates;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Мне нужен ФИЛЬТР, а не ЭТО!!!');
    }
    this.invitedFriends = getCandidate(friends).filter(function (a) {
        return filter.isRight(a);
    });
}

Iterator.prototype.done = function () {
    return this.invitedFriends.length === 0;
};

Iterator.prototype.next = function () {
    var friend = this.invitedFriends.shift();
    delete friend.level;

    return friend || null;
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
    this.invitedFriends = this.invitedFriends.filter(function (friend) {
        return friend.level <= maxLevel;
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isRight = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isRight = function (human) {
        return human.gender === 'male';
    };
}
MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isRight = function (human) {
        return human.gender === 'female';
    };
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
