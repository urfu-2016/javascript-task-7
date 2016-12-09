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
    if (!(filter instanceof Filter)) {
        throw new TypeError('Incorrect filter!');
    }

    var level = 0;
    var friendsCollection = [];
    var isFriendInCollection = function (friend) {
        return friendsCollection.indexOf(friend) === -1;
    };
    var peopleForInviting = friends.filter(function (person) {
        return person.best;
    }).sort(sortByName);

    while (peopleForInviting.length > 0 && level < maxLevel) {
        friendsCollection = friendsCollection.concat(peopleForInviting);
        peopleForInviting = getUniqueFriends(peopleForInviting)
            .map(function (name) {
                return friends.find(function (person) {
                    return person.name === name;
                });
            })
            .filter(isFriendInCollection)
            .sort(sortByName);
        level++;
    }

    return filter.filter(friendsCollection);
}

function sortByName(a, b) {
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }

    return 0;
}

function getUniqueFriends(friends) {
    return friends.reduce(function (newFriends, friend) {
        return newFriends.concat(friend.friends.filter(function (name) {
            return newFriends.indexOf(name) === -1;
        }));
    }, []);
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
    this.filteringValues = [];
}

Filter.prototype.filter = function (friends) {
    return friends.filter(function (person) {
        return this.filteringValues.indexOf(person.gender) !== -1 || !this.filteringValues.length;
    }, this);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filteringValues = ['male'];
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filteringValues = ['female'];
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
