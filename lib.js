'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this.friendsCollection = getFilteredFriends(friends, filter, Infinity);
    this.currentIndex = 0;
}

Iterator.prototype.done = function () {
    return this.friendsCollection.length === this.currentIndex;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    var person = this.friendsCollection[this.currentIndex];
    this.currentIndex++;

    return person;
};

function getFilteredFriends(friends, filter, maxLevel) {
    if (filter instanceof Filter === false) {
        throw new TypeError('Incorrect filter!');
    }
    var friendsCollection = [];
    var filterNote = function (friend) {
        return friendsCollection.indexOf(friend) === -1;
    };
    var bestFriends = friends.filter(function (person) {
        return person.best;
    }).sort(sortByName);
    while (bestFriends.length > 0 && maxLevel > 0) {
        friendsCollection = friendsCollection.concat(bestFriends);
        bestFriends = getUniqueFriends(bestFriends)
            .map(function (name) {
                return friends.filter(function (person) {
                    return person.name === name;
                })[0];
            })
            .sort(sortByName)
            .filter(filterNote);
        maxLevel--;
    }

    return friendsCollection.filter(filter.filter);
}

function sortByName(a, b) {
    if (a.name > b.name) {

        return 1;
    } else if (a.name < b.name) {

        return -1;
    }

    return 0;
}

function getUniqueFriends(collection) {
    var result = [];
    collection.forEach(function (element) {
        var newFriends = element.friendsCollection;
        if (newFriends !== undefined || newFriends.length > 0) {
            newFriends.forEach(function (friend) {
                if (result.indexOf(friend) === -1) {
                    result.push(friend);
                }
            });
        }
    });

    return result;
}

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
    this.friendsCollection = getFilteredFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

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
    this.filter = function (person) {
        return person.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = function (person) {
        return person.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
