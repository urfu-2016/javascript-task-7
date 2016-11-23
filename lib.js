'use strict';

function sortByName(firstName, secondName) {
    if (firstName > secondName) {
        return 1;
    } else if (secondName < firstName) {
        return -1;
    }

    return 0;
}

function getFriend(friends, name) {

    return friends.filter(function (friend) {
        return friend.name === name;
    })[0];
}

function collectFriends(friends, filter, maxLevel) {
    var visitedFriends = [];
    maxLevel = maxLevel > 0 ? maxLevel : 0;
    var friendsToVisit = friends
        .filter(function (friend) {
            return friend.best;
        })
        .map(function (friend) {
            return friend.name;
        });

    while (friendsToVisit.length > 0 && maxLevel > 0) {
        friendsToVisit = friendsToVisit
            .sort(sortByName)
            .reduce(function (currentFriendsToVisit, friendName, index, arr) {
                var currentFriend = getFriend(friends, friendName);
                var filteredFriends = currentFriend.friends
                    .filter(function (friend) {
                        return (
                            visitedFriends.indexOf(getFriend(friends, friend)) === -1 &&
                            arr.indexOf(friend) === -1);
                    });
                visitedFriends.push(currentFriend);

                return currentFriendsToVisit.concat(filteredFriends);
            }, []);

        maxLevel--;
    }

    return visitedFriends.filter(filter.filter);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong filter argument');
    }

    this.friends = collectFriends(friends, filter, Infinity);
}

Iterator.prototype.done = function () {
    return this.friends.length === 0;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.friends.shift();
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

    Iterator.call(this, friends, filter);
    this.friends = collectFriends(friends, filter, maxLevel);
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
    this.filter = function (friend) {
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
    this.filter = function (friend) {
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
