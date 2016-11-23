'use strict';

/**
* Сортировка в алфавиттном порядке
*
* @param {Object} firstFriend
* @param {Object} secondFriend
*/

function alphabeticalOrder(firstFriend, secondFriend) {
    return firstFriend.name.localeCompare(secondFriend.name);
}

function isBestFriend(friend) {
    return friend.best === true;
}

function getFriend(friends, name) {
    return friends.filter(function (friend) {
        return friend.name === name;
    })[0];
}

function invitedGuests(friends, filter, maxLevel) {
    var guests = friends.filter(function (friend) {
        return isBestFriend(friend);
    });
    var invitedFriends = [];
    while (maxLevel > 0 && guests.length !== 0) {
        var countFriend = guests.length;
        guests.sort(alphabeticalOrder).forEach(function (friend) {
            if (invitedFriends.indexOf(friend) === -1) {
                invitedFriends.push(friend);
                friend.friends.forEach(function (name) {
                    var invitedFriend = getFriend(friends, name);
                    guests.push(invitedFriend);
                });
            }
        });
        guests.splice(0, countFriend);
        maxLevel--;
    }

    return invitedFriends.filter(function (friend) {
        return filter.suitableGender(friend);
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
    this.currentIndex = 0;
    this.invitedGuests = invitedGuests(friends, filter, Infinity);
}

Iterator.prototype.done = function () {
    return this.currentIndex >= this.invitedGuests.length;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.invitedGuests[this.currentIndex++];
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
    this.currentIndex = 0;
    this.invitedGuests = invitedGuests(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.suitableGender = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.suitableGender = function (friend) {
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
    this.suitableGender = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
