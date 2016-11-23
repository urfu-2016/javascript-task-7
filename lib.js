'use strict';

function getNextCircle(oldCircle, friends) {
    return oldCircle.reduce(function (nextCircle, friend) {
        return nextCircle.concat(friend.friends);
    }, [])
    .map(function (name) {
        return getFriendByName(name, friends);
    });
}
function getFriendByName(friendName, friends) {
    var foundFriend = friends.find(function (friend) {
        return friend.name === friendName;
    });

    return foundFriend;
}
// function removeExistingFriends(candidates, friendsCircle) {
//     return friendsCircle.filter(function (friend) {
//         return candidates.indexOf(friend) === -1;
//     });
// }
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
    while (currentFriendsCircle.length !== 0) {
        currentFriendsCircle = currentFriendsCircle.sort(function (a, b) {
            return compare(a.name, b.name);
        });
        currentFriendsCircle = currentFriendsCircle.filter(function (friend) {
            return candidates.indexOf(friend) === -1;
        });
        currentFriendsCircle.forEach(function (friend) {
            if (candidates.indexOf(friend) === -1) {
                candidates.push(friend);
            }
        });
        for (var i = 0; i < currentFriendsCircle.length; i++) {
            currentFriendsCircle[i].level = currentLevel;
        }
        currentFriendsCircle = getNextCircle(currentFriendsCircle, friends);
        currentLevel++;

        // currentFriendsCircle = removeExistingFriends(candidates, currentFriendsCircle);
        // candidates = candidates.concat(currentFriendsCircle);

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
    if (this.done()) {
        return null;
    }
    var friend = this.invitedFriends.shift();
    delete friend.level;

    return friend;
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
