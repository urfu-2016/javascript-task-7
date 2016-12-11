'use strict';

/**
 * @param {Object} friendFirst - first friend for compare
 * @param {Object} secondFirst - second friend for compare
 * @return {Object} invitedFriends - friend wich was finded in initial list of friends
 */

function sortFriends(friendFirst, friendSecond) {
    var firstName = friendFirst.name;
    var secondName = friendSecond.name;

    return firstName > secondName ? 1 : -1;
}

/**
 * @param {Object[]} friends
 * @param {String} subFriendName - name of selected subFriend
 * @return {Object} invitedFriends - friend wich was finded in initial list of friends
 */

function searchFriends(friends, subFriendName) {
    var invitedFriends = {};

    friends.forEach(function (friend) {

        if (friend.name === subFriendName) {
            invitedFriends = friend;
        }
    });

    return invitedFriends;
}

/**
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 * @return {Object[]} selectedFriends - filtered array of friends
 */

function iterateByFriends(friends, filter, maxLevel) {
    var firstLevel = [];
    var secondLevel = [];
    var selectedFriends = [];

    friends.forEach(function (friend) {

        if (friend.best) {
            firstLevel.push(friend);
        }
    });

    maxLevel = (!isNaN(maxLevel + 0) && maxLevel >= 0) ? maxLevel : Infinity;

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
 * @constructor Iterator
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
 * @constructor Iterator
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
 * @constructor Filter
 * @return {boolean} true/false - common filtered by sex
 */

function Filter() {
    this.gender = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor MaleFilter
 * @return {boolean} true/false - filtered by sex (male)
 */

function MaleFilter() {
    this.gender = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor FemaleFilter
 * @return {boolean} true/false - filtered by sex (female)
 */

function FemaleFilter() {
    this.gender = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
