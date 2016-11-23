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
    var foundFriends = friends.filter(function (friend) {
        return friend.name === friendName;
    });

    return foundFriends[0];
}
// function removeExistingFriends(candidates, friendsCircle) {
//     return friendsCircle.filter(function (friend) {
//         return candidates.indexOf(friend) === -1;
//     });
// }

function getCandidate(friends) {
    var currentFriendsCircle = friends.filter(function (friend) {
        return friend.best;
    });
    var candidates = [];
    var currentLevel = 1;
    while (currentFriendsCircle.length !== 0) {
        currentFriendsCircle = currentFriendsCircle.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        for (var i = 0; i < currentFriendsCircle.length; i++) {
            candidates.push({
                friend: currentFriendsCircle[i],
                level: currentLevel
            });
        }
        currentFriendsCircle = getNextCircle(currentFriendsCircle, friends)
        .filter(function (currentFriend) {
            return !candidates.some(function (candidate) {
                return candidate.friend === currentFriend;
            });
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
    this.invitedFriends = getCandidate(friends).filter(function (candidate) {
        return filter.isRight(candidate.friend);
    });
}

Iterator.prototype.done = function () {
    return this.invitedFriends.length === 0;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    var friendAndLevel = this.invitedFriends.shift();

    return friendAndLevel.friend;
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
