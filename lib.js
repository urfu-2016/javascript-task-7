'use strict';

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
    this.index = 0;
    this.guests = getGuests(friends, filter, 100);
}

Iterator.prototype.done = function () {

    return this.index === this.guests.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    var guest = this.guests[this.index];
    this.index++;

    return guest;
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
    this.index = 0;
    this.guests = getGuests(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    console.info('Filter');
    this.active = function () {

        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    console.info('MaleFilter');
    this.active = function (friend) {

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
    console.info('FemaleFilter');
    this.active = function (friend) {

        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

function getFriend(friends, name) {
    var gettingFriend = {};
    friends.forEach(function (friend) {
        if (friend.name === name) {
            gettingFriend = friend;
        }
    });

    return gettingFriend;
}

var guestsNames = [];

function getGuests(friends, filter, limit) {
    if (limit < 1) {

        return [];
    }
    var guests = [];
    friends.forEach(function (friend) {
        if (friend.best) {
            guests.push(friend);
            guestsNames.push(friend.name);
        }
    });
    guests.sort(function (guest1, guest2) {

        return guest1.name < guest2.name ? -1 : 1;
    });
    for (var circle = 1; circle < limit; circle++) {
        var newGuests = getNewGuests(guests, friends);
        newGuests.sort(function (guest1, guest2) {

            return guest1.name < guest2.name ? -1 : 1;
        });
        guests = guests.concat(newGuests);
    }
    guestsNames = [];

    return guests.filter(filter.active);
}

function getNewGuests(guests, friends) {
    var newGuests = [];
    guests.forEach(function (friend) {
        var friendFriends = friend.friends;
        friendFriends.forEach(function (friendFriend) {
            if (guestsNames.indexOf(friendFriend) === -1) {
                guestsNames.push(friendFriend);
                newGuests.push(getFriend(friends, friendFriend));
            }
        });
    });

    return newGuests;
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
