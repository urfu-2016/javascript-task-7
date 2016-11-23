'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
var listAllPersons;
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

function foundFirstCircle() {
    return listAllPersons.filter(function (person) {
        return person.best === true;
    }).sort(compareAlphabetically);
}

function foundNextCircle(currentListFriends) {
    var namesFriends = [];
    currentListFriends.forEach(function (person) {
        for (var i = 0; i < person.friends.length; i++) {
            if (namesFriends.indexOf(person.friends[i]) === -1) {
                namesFriends.push(person.friends[i]);
            }
        }
    });

    var ansList = listAllPersons.filter(function (person) {
        var usedName = usedFriendNames.indexOf(person.name) !== -1;
        if (namesFriends.indexOf(person.name) !== -1 && !usedName) {
            usedFriendNames.push(person.name);
        }

        return (namesFriends.indexOf(person.name) !== -1 && !usedName);
    }).sort(compareAlphabetically);

    return ansList;
}

function getGuests(maxLevel) {
    var listBestFriends = [].concat(foundFirstCircle());
    usedFriendNames = listBestFriends.map(function (person) {
        return person.name;
    });
    var listGuests = [].concat(listBestFriends);
    var currentListFriends = listBestFriends;
    var level = maxLevel;
    while (level > 1 && currentListFriends.length !== 0) {
        level--;
        currentListFriends = foundNextCircle(currentListFriends);
        listGuests = listGuests.concat(currentListFriends);
    }

    return listGuests;
}

function Iterator(friends, filter) {
    // usedFriendNames = [];
    listAllPersons = friends.slice();
    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect data type Filter');
    }
    // this.indexPersons = 0;
    this.listGuests = getGuests(Infinity).filter(function (friend) {
        return filter.filterFriends(friend);
    });
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
    listAllPersons = friends.slice();
    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect data type Filter');
    }
    if (maxLevel <= 0) {
        this.listGuests = [];
    } else {

        // this.indexPersons = 0;
        this.listGuests = getGuests(maxLevel).filter(function (friend) {
            return filter.filterFriends(friend);
        });
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
