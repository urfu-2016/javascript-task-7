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
    this.collected = 0;
    this.guests = getCorrectFriends(friends, filter, Infinity);
}

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    var index = this.collected;
    this.collected++;

    return this.guests[index];
};

Iterator.prototype.done = function () {
    return this.collected === this.guests.length;
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
    this.collected = 0;
    this.guests = getCorrectFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.activeFilter = function () {
        return true;
    };
    console.info('Filter');
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.activeFilter = function (friend) {
        return friend.gender === 'male';
    };
    console.info('MaleFilter');
}


MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.activeFilter = function (friend) {
        return friend.gender === 'female';
    };
    console.info('FemaleFilter');
}

FemaleFilter.prototype = Object.create(Filter.prototype);

function getCorrectFriends(friends, filter, limit) {
    var guests = [];
    var wave = friends.filter(function (friend) {
        return friend.best;
    });
    var deleteVisited = function (friend) {
        return guests.indexOf(friend) === -1;
    };
    while (limit > 0 && wave.length !== 0) {
        wave = wave.sort(function (firstFriend, secondFriend) {
            return firstFriend.name > secondFriend.name;
        });
        guests = guests.concat(wave);
        var newWave = formNewWaveNames(wave, friends);
        wave = newWave.filter(deleteVisited);
        limit--;
    }

    return guests.filter(filter.activeFilter);
}

function findObjectByName(friends, name) {
    var aim;
    friends.forEach(function (friend) {
        if (friend.name === name) {
            aim = friend;
        }
    });

    return aim;
}

function formNewWaveNames(previousWave, friends) {
    var guestNames = getAllFriends(previousWave);

    return guestNames.map(function (name) {
        return findObjectByName(friends, name);
    });
}

function getAllFriends(wave) {
    var allFriends = [];
    wave.forEach(function (friend) {
        friend.friends.forEach(function (name) {
            if (allFriends.indexOf(name) === -1) {
                allFriends.push(name);
            }
        });
    });

    return allFriends;
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
