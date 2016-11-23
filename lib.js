'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */

function compareAlphabetically(person1, person2) {
    return person1.name.localeCompare(person2.name);
}

function getFirstCircle(friends) {
    return friends.filter(function (person) {
        return person.best === true;
    }).sort(compareAlphabetically);
}

function getNextCircle(friends, currFriends, listGuests) {
    currFriends.sort(compareAlphabetically).forEach(function (person) {
        if (listGuests.indexOf(person) === -1) {
            listGuests.push(person);
            person.friends.forEach(function (name) {
                var guest = friends.filter(function (friend) {
                    return friend.name === name;
                })[0];
                currFriends.push(guest);
            });
        }
    });

    return [currFriends, listGuests];
}

function getGuests(friends, filter, maxLevel) {
    var currFriends = [].concat(getFirstCircle(friends));
    var listGuests = [];
    var level = maxLevel;
    while (level > 0 && currFriends.length !== 0) {
        var countFriends = currFriends.length;
        var resultNextCircle = getNextCircle (friends, currFriends, listGuests);
        currFriends = resultNextCircle[0];
        listGuests = resultNextCircle[1];
        currFriends.splice(0, countFriends);
        level--;
    }

    return listGuests.filter(function (friend) {
        return filter.filterFriends(friend);
    });
}

function Iterator(friends, filter) {

    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect data type Filter');
    }
    // this.currIndex = 0;
    this.listGuests = getGuests(friends, filter, Infinity);
    this.listGuests.reverse();
}

Iterator.prototype.done = function () {
    return this.listGuests.length <= 0;
    // return this.currIndex >= this.listGuests.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    // return this.listGuests[this.currIndex++];
    return this.listGuests.pop();
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
    maxLevel = (typeof maxLevel === 'undefined') ? 0 : maxLevel;
    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect data type Filter');
    }
    if (maxLevel <= 0) {
        this.listGuests = [];
    } else {
        // this.currIndex = 0;
        this.listGuests = getGuests(friends, filter, maxLevel);
        this.listGuests.reverse();
    }
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filterFriends = function (friend) {
        return friend.gender === 'male';
    };
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filterFriends = function (friend) {
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
