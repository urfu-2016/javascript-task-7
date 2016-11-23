'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
// var listAllPersons;
var usedFriendNames;
function compareAlphabetically(person1, person2) {
    if (person1.name > person2.name) {
        return 1;
    }
    if (person1.name < person2.name) {
        return -1;
    }

    return 0;
}

function foundFirstCircle(friends) {
    return friends.filter(function (person) {
        return person.best === true;
    }).sort(compareAlphabetically);
}

function foundNextCircle(friends, currentListFriends) {
    var namesFriends = [];
    currentListFriends.sort(compareAlphabetically).forEach(function (person) {
        for (var i = 0; i < person.friends.length; i++) {
            if (namesFriends.indexOf(person.friends[i]) === -1) {
                namesFriends.push(person.friends[i]);
            }
        }
    });

    var ansList = friends.filter(function (person) {
        var along = person.friends.length === 0;
        var usedName = usedFriendNames.indexOf(person.name) !== -1;
        if (namesFriends.indexOf(person.name) !== -1 && !usedName && !along) {
            usedFriendNames.push(person.name);
        }

        return (namesFriends.indexOf(person.name) !== -1 && !usedName);
    }).sort(compareAlphabetically);

    return ansList;
}

function getGuests(friends, filter, maxLevel) {
    var listBestFriends = [].concat(foundFirstCircle(friends));
    usedFriendNames = listBestFriends.map(function (person) {
        return person.name;
    });
    var listGuests = [];
    var currListFriends = listBestFriends.sort(compareAlphabetically);
    var level = maxLevel;
    while (level > 0 && currListFriends.length !== 0) {
        listGuests = listGuests.concat(currListFriends);
        currListFriends = foundNextCircle(friends, currListFriends.sort(compareAlphabetically));
        level--;
    }

    return listGuests.filter(function (friend) {
        return filter.filterFriends(friend);
    });
}

function Iterator(friends, filter) {
    // usedFriendNames = [];
    // listAllPersons = friends.slice();
    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect data type Filter');
    }
    // this.indexPersons = 0;
    this.listGuests = getGuests(friends, filter, Infinity);
    this.listGuests.reverse();
}
Iterator.prototype.done = function () {
    return this.listGuests.length <= 0;

    // return this.indexPersons >= this.listGuests.length;
};
Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.listGuests.pop();
    // var index = this.indexPersons++;

    // return this.listGuests[this.listGuests.length - index - 1];
    // return this.done() ? null : this.listGuests.pop();
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
    // listAllPersons = friends.slice();
    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect data type Filter');
    }
    if (maxLevel <= 0) {
        this.listGuests = [];
    } else {

        // this.indexPersons = 0;
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
