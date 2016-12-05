'use strict';

function sortFriends(a, b) {
    return a.name - b.name;
}

function searchFriends(friends, subFriendName) {
    var invitedFriends = {};

    friends.forEach(function (friend) {
        if (friend.name === subFriendName) {
            invitedFriends = friend;
        }
    });

    return invitedFriends;
}

function iterateByFriends(friends, filter, maxLevel) {
    var firstLevel = [];
    var secondLevel = [];
    var selectedFriends = [];

    friends.forEach(function (friend) {
        if (friend.best) {
            firstLevel.push(friend);
        }
    });

    maxLevel = maxLevel || Infinity;

    while (maxLevel > 0) {
        firstLevel.sort(sortFriends).forEach(function (friend) {
            if (selectedFriends.indexOf(friend) === -1) {
                selectedFriends.push(friend);
                friend.friends.forEach(function (subFriendName) {
                    var subFriend = searchFriends(friends, subFriendName);
                    secondLevel.push(subFriend);
                });
            }
        });

        if (secondLevel.length === 0) {
            break;
        }

        firstLevel = secondLevel.slice();
        secondLevel.length = 0;
        maxLevel--;
    }

    return selectedFriends.filter(function (selectFriend) {
        return filter.gender(selectFriend);
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

    this.iterateByFriends = iterateByFriends(friends, filter);
    this.countFriends = 0;
}

Iterator.prototype.done = function () {
    return this.countFriends >= this.iterateByFriends.length;
};
Iterator.prototype.next = function () {
    return this.done() ? null : this.iterateByFriends[this.countFriends++];
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
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }

    this.iterateByFriends = iterateByFriends(friends, filter, maxLevel);
    this.countFriends = 0;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.gender = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */

function MaleFilter() {
    this.gender = function (friend) {
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
    this.gender = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
