'use strict';

function sortByName(firstName, secondName) {
    if (firstName === secondName) {
        return 0;
    }

    return firstName > secondName ? 1 : -1;
}

function getFriend(friends, name) {
    return friends.filter(function (friend) {
        return friend.name === name;
    })[0];
}

function getBestFriendsNames(friends) {
    return friends
        .filter(function (friend) {
            return friend.best;
        })
        .map(function (friend) {
            return friend.name;
        });
}

// function getFriendsObjects(friends, visitedFriends) {
//     return visitedFriends
//         // Получим по именам объекты друзей
//         .reduce(function (visitedFriendsObjects, visitedFriend) {
//             visitedFriendsObjects.push(getFriend(friends, visitedFriend));

//             return visitedFriendsObjects;
//         }, []);
// }

function collectFriends(friends, filter, maxLevel) {
    var visitedFriends = [];
    maxLevel = maxLevel > 0 ? maxLevel : 0;
    var currentLevelFriends = getBestFriendsNames(friends);

    while (currentLevelFriends.length > 0 && maxLevel > 0) {
        currentLevelFriends = currentLevelFriends
            .sort(sortByName)
            .reduce(function (nextLevelFriends, friendName, index, arr) {
                var currentFriend = getFriend(friends, friendName);
                visitedFriends.push(currentFriend);
                var filteredFriends = currentFriend.friends
                    .filter(function (friend) {
                        return (
                            visitedFriends.indexOf(getFriend(friends, friend)) === -1 &&
                            nextLevelFriends.indexOf(friend) === -1 &&
                            arr.indexOf(friend) === -1);
                    });

                return nextLevelFriends.concat(filteredFriends);
            }, []);
        maxLevel--;
    }

    return visitedFriends.filter(filter.filterFunction);
}

function validateFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong filter argument');
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 */
function Iterator(friends, filter) {
    validateFilter(filter);
    this.index = 0;
    this.friends = collectFriends(friends, filter, Infinity);
}

Iterator.prototype.done = function () {
    return this.friends.length === this.index;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.friends[this.index++];
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
    validateFilter(filter);
    this.index = 0;
    this.friends = collectFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    // Filter constructor
}

Filter.prototype.filter = function () {
    return true;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    // MaleFilter constructor
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;
MaleFilter.prototype.filterFunction = function (friend) {
    return friend.gender === 'male';
};

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    // FemaleFilter constructor
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;
FemaleFilter.prototype.filterFunction = function (friend) {
    return friend.gender === 'female';
};

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
