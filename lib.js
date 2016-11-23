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
    this.filteredFriends = getFriends(friends, Infinity).filter(filter.abc);
}

Iterator.prototype.nextIndex = 0;

Iterator.prototype.next = function () {
    return this.done() ? null : this.filteredFriends[this.nextIndex++];
};

Iterator.prototype.done = function () {
    return this.nextIndex >= this.filteredFriends.length;
};

function getInformationByName(friends, name) {
    return friends.filter(function (friend) {
        return friend.name === name;
    })[0];
}

function getFriendsOfFriends(friendsGraph, friendsNodes) {
    var result = [];
    friendsNodes.forEach(function (friend) {
        if (friend.hasOwnProperty('friends')) {
            var a = friend.friends.sort();
            a.forEach(function (b) {
                result.push(getInformationByName(friendsGraph, b));
            });
        }
    });

    return result;
}

function friendsComparer(first, second) {
    if (first.name > second.name) {
        return 1;
    }

    return first.name === second.name ? 0 : -1;
}

function nextStep(queue, visited, friends) {
    return getFriendsOfFriends(friends, queue)
        .filter(function (person) {
            return visited.indexOf(person) === -1;
        })
        .sort(friendsComparer);
}

function getFriends(friends, maxLevel) {
    var visited = []; // lint не дает использовать Set :(
    var queue = friends.filter(function (person) {
        return person.best;
    });
    var allFriends = [].slice.call(queue);
    queue.forEach(function (person) {
        visited.push(person);
    });

    for (var level = 2; level <= maxLevel; level++) {
        var newQueue = nextStep(queue, visited, friends);
        if (!newQueue.length) {
            return allFriends;
        }
        queue = [];
        for (var j = 0; j < newQueue.length; j++) {
            queue.push(newQueue[j]);
            visited.push(newQueue[j]);
            allFriends.push(newQueue[j]);
        }
    }

    return allFriends;
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
    this.filteredFriends = getFriends(friends, maxLevel).filter(filter.abc);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.abc = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.abc = function abc(person) {
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
    this.abc = function (person) {
        return person.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
