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

function collectFriends(friends, friendsDict, filter, maxLevel) {
    var visitedFriends = [];
    var appropriateFriends = [];
    var friendsToVisit = friends
        .filter(function (friend) {
            return friend.best;
        })
        .sort(sortByName);

    var currentDepth;
    if (maxLevel > 0) {
        currentDepth = 1;
    } else if (maxLevel <= 0) {
        return [];
    }

    while (friendsToVisit.length > 0) {
        friendsToVisit = friendsToVisit
            .reduce(function (currentFriendsToVisit, currentFriend) {

                var filteredFriends = getFriendsOfFriend(currentFriend, friendsDict)
                    .filter(function (friend) {
                        return !isArrayContainsFriend(visitedFriends, friend);
                    })
                    .sort(sortByName);

                currentFriendsToVisit = currentFriendsToVisit.concat(filteredFriends);
                visitedFriends.push(currentFriend);

                if (filter.filter(currentFriend) &&
                    !isArrayContainsFriend(appropriateFriends, currentFriend)) {
                    appropriateFriends.push(currentFriend);
                }

                return currentFriendsToVisit;
            }, []);

        if (currentDepth) {
            currentDepth++;
        }

        if (currentDepth > maxLevel) {
            break;
        }
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

    var friendsDict = getFriendsDict(friends);
    this.friends = collectFriends(friends, friendsDict, filter, maxLevel);
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

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
