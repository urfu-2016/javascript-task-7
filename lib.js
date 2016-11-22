'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
var listAllPersons;
var usedFriendNames;
var countCircles;

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
    countCircles++;

    return listAllPersons.filter(function (person) {
        return person.best === true;
    }).sort(compareAlphabetically);
}

function foundNextCircle(currentListFriends) {
    countCircles++;
    var namesFriends = [];
    currentListFriends.forEach(function (person) {
        for (var i = 0; i < person.friends.length; i++) {
            if (namesFriends.indexOf(person.friends[i]) === -1) {
                namesFriends.push(person.friends[i]);
            }
        }
    });

    return listAllPersons.filter(function (person) {
        var usedName = usedFriendNames.indexOf(person.name) !== -1;
        if (namesFriends.indexOf(person.name) !== -1 && !usedName) {
            usedFriendNames.push(person.name);
        }

        return (namesFriends.indexOf(person.name) !== -1 && !usedName);
    }).sort(compareAlphabetically);
}

function foundIncoherentFriends() {
    return listAllPersons.filter(function (person) {
        return usedFriendNames.indexOf(person.name) === -1;
    }).sort(compareAlphabetically);
}

function getListGuest() {
    var listBestFriends = [].concat(foundFirstCircle());
    usedFriendNames = listBestFriends.map(function (person) {
        return person.name;
    });
    var listGuests = [].concat(listBestFriends);
    var currentListFriends = foundNextCircle(listBestFriends);
    listGuests = listGuests.concat(currentListFriends);

    while (currentListFriends.length !== 0) {
        currentListFriends = foundNextCircle(currentListFriends);
        listGuests = listGuests.concat(currentListFriends);
    }
    if (usedFriendNames.length !== listAllPersons.length) {
        currentListFriends = foundIncoherentFriends();
        listGuests = listGuests.concat(currentListFriends);
    }

    return listGuests;
}

function Iterator(friends, filter) {
    usedFriendNames = [];
    listAllPersons = friends;
    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect data type Filter');
    }
    this.listGuests = getListGuest();
    this.listGuests = this.listGuests.filter(function (friend) {
        return filter.filterFriends(friend);
    });
    this.listGuests.reverse();
}
Iterator.prototype.done = function () {
    return this.listGuests.length === 0;
};
Iterator.prototype.next = function () {
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
    countCircles = 0;
    usedFriendNames = [];
    listAllPersons = friends;
    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect data type Filter');
    }
    var listBestFriends = [].concat(foundFirstCircle());
    usedFriendNames = listBestFriends.map(function (person) {
        return person.name;
    });
    this.listGuests = [].concat(listBestFriends);
    var currentListFriends = foundNextCircle(listBestFriends);
    this.listGuests = this.listGuests.concat(currentListFriends);

    while (countCircles !== maxLevel) {
        currentListFriends = foundNextCircle(currentListFriends);
        this.listGuests = this.listGuests.concat(currentListFriends);
    }
    this.listGuests = this.listGuests.filter(function (friend) {
        return filter.filterFriends(friend);
    });
    this.listGuests.reverse();
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
