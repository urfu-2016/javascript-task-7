'use strict';

function sortByName(firstFriend, secondFriend) {
    if (firstFriend.name > secondFriend.name) {
        return 1;
    } else if (secondFriend.name < firstFriend.name) {
        return -1;
    }

    return 0;
}

function getFriendsDict(friends) {
    return friends
        .reduce(function (dict, currentFriend) {
            dict[currentFriend.name] = {
                friends: currentFriend.friends,
                gender: currentFriend.gender
            };

            if (currentFriend.best) {
                dict[currentFriend.name].best = currentFriend.best;
            }

            return dict;
        }, {});
}

function isArrayContainsFriend(array, friend) {
    return array
        .some(function (currentFriend) {
            return currentFriend.name === friend.name;
        });
}

function getFriendsOfFriend(currentFriend, friendsDict) {
    return currentFriend.friends
        .reduce(function (result, friend) {
            var friendWithName = friendsDict[friend];
            friendWithName.name = friend;
            result.push(friendWithName);

            return result;
        }, []);
}

function collectFriends(friends, filter, maxLevel) {
    var visitedFriends = [];
    var appropriateFriends = [];
    var friendsDict = getFriendsDict(friends);
    maxLevel = maxLevel === undefined ? Infinity : maxLevel;
    var friendsToVisit = friends
        .filter(function (friend) {
            return friend.best;
        })
        .sort(sortByName);

    while (friendsToVisit.length > 0 && maxLevel > 0) {
        friendsToVisit = friendsToVisit
            .reduce(function (currentFriendsToVisit, currentFriend, index, arr) {

                var filteredFriends = getFriendsOfFriend(currentFriend, friendsDict)
                    .filter(function (friend) {
                        return (
                            !isArrayContainsFriend(visitedFriends, friend) &&
                            !isArrayContainsFriend(arr, friend));
                    });

                visitedFriends.push(currentFriend);
                if (filter.filter(currentFriend)) {
                    appropriateFriends.push(currentFriend);
                }

                return currentFriendsToVisit.concat(filteredFriends);
            }, [])
            .sort(sortByName);

        maxLevel--;
    }

    return appropriateFriends;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 */
function Iterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong filter argument');
    }

    this.friends = collectFriends(friends, filter, maxLevel);
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

    Iterator.call(this, friends, filter, maxLevel);
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
