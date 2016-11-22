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

function alphabeticalOrderTwo(firstFriend, secondFriend) {
    return firstFriend.localeCompare(secondFriend);
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
    }).sort(alphabeticalOrder);
    var invitedFriends = [].concat(guests);
    while (maxLevel > 1 && guests.length !== 0) {
        var countFriend = guests.length;
        guests.forEach(function (friend) {
            friend.friends.sort(alphabeticalOrderTwo).forEach(function (name) {
                var invitedFriend = getFriend(friends, name);
                if (invitedFriends.indexOf(invitedFriend) === -1) {
                    guests.push(invitedFriend);
                    invitedFriends.push(invitedFriend);
                }
            });
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
    this.currentIndex = 0;
    this.invitedGuests = invitedGuests(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
// LimitedIterator.prototype.constructor = LimitedIterator;

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
// MaleFilter.prototype.constructor = MaleFilter;

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
// FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
