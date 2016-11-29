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
    this.filteredFriends = getFriends(friends, Infinity).filter(filter.isAccepted);
}

Iterator.prototype.nextIndex = 0;

Iterator.prototype.next = function () {
    return this.done() ? null : this.filteredFriends[this.nextIndex++];
};

Iterator.prototype.done = function () {
    return this.nextIndex === this.filteredFriends.length;
};

function HashSet() {
    this.hashTable = {};
    this.contains = function (person) {
        return this.hashTable.hasOwnProperty(person.name);
    };
    this.add = function (person) {
        this.hashTable[person.name] = person;
    };
    this.addRange = function (persons) {
        persons.forEach(this.add, this);
    };
    this.getPersons = function () {
        var hashTable = this.hashTable;

        return Object.keys(this.hashTable).map(function (key) {
            return hashTable[key];
        });
    };
}

function getBestFriends(friends) {
    return friends
        .filter(function (friend) {
            return friend.best;
        })
        .sort(friendsComparer);
}

function getFriendByName(name, friends) {
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].name === name) {
            return friends[i];
        }
    }
}

function getFriendsOfFriend(friend, allFriends) {
    return friend.friends.map(function (name) {
        return getFriendByName(name, allFriends);
    });
}

function friendsComparer(first, second) {
    return first.name.localeCompare(second.name);
}

function getFriendsOfNextLevel(queue, allFriends, visited) {
    var friends = queue.reduce(function (result, friend) {
        return result.concat(getFriendsOfFriend(friend, allFriends));
    }, []);

    return friends
        .filter(function (friend) {
            return !visited.contains(friend);
        })
        .sort(friendsComparer);
}

function getFriends(friends, maxLevel) {
    if (maxLevel < 1) {
        return [];
    }
    var visited = new HashSet();
    visited.addRange(getBestFriends(friends));
    var queue = visited.getPersons();
    var currentLevel = 2;
    while (currentLevel <= maxLevel && queue.length) {
        queue = getFriendsOfNextLevel(queue, friends, visited);
        visited.addRange(queue);
        currentLevel++;
    }

    return visited.getPersons();
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
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this.filteredFriends = getFriends(friends, maxLevel).filter(filter.isAccepted);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isAccepted = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isAccepted = function abc(person) {
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
    this.isAccepted = function (person) {
        return person.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
