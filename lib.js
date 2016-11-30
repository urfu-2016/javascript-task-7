'use strict';

/* eslint no-empty-function: ["error", { "allow": ["functions"] }]*/

function sortByName(firstPerson, secondPerson) {
    if (firstPerson.name === secondPerson.name) {
        return 0;
    }

    return firstPerson.name > secondPerson.name ? 1 : -1;
}

function getBestFriends(friends) {
    return friends
        .filter(function (friend) {
            return friend.best;
        });
}

function getFriendsDict(friends) {
    return friends.reduce(function (friendsDict, friend) {
        friendsDict[friend.name] = friend;

        return friendsDict;
    }, {});
}

function collectFriends(friends, filter, maxLevel) {
    var visitedFriends = [];
    var friendsToVisit = getBestFriends(friends);
    var friendsDict = getFriendsDict(friends);
    maxLevel = maxLevel === undefined ? Infinity : maxLevel;
    maxLevel = maxLevel > 0 ? maxLevel : 0;

    while (maxLevel > 0 && friendsToVisit.length > 0) {
        var currentLevelLength = friendsToVisit.length;
        friendsToVisit
            .sort(sortByName)
            .forEach(function (currentLevelFriend) {
                visitedFriends.push(currentLevelFriend);
                currentLevelFriend.friends
                    .forEach(function (nextLevelFriend) {
                        var nextLevelFriendObject = friendsDict[nextLevelFriend];

                        if (visitedFriends.indexOf(nextLevelFriendObject) === -1 &&
                            friendsToVisit.indexOf(nextLevelFriendObject) === -1) {
                            friendsToVisit.push(nextLevelFriendObject);
                        }
                    });
            });

        friendsToVisit.splice(0, currentLevelLength);
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
 */
function Iterator(friends, filter) {
    validateFilter(filter);
    this.index = 0;
    this.friends = collectFriends.apply(null, arguments);
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
    Iterator.call(this, friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {}

Filter.prototype.filterFunction = function () {
    return true;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {}

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
function FemaleFilter() {}

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
