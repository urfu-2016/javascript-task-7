'use strict';

function sortByNameAndFrendshipType(firstFriend, secondFriend) {
    var nameRelation = 0;

    if (firstFriend.name > secondFriend.name) {
        nameRelation = 1;
    } else if (secondFriend.name < firstFriend.name) {
        nameRelation = -1;
    }

    if (firstFriend.best && secondFriend.best) {
        return nameRelation;
    } else if (firstFriend.best) {
        return -1;
    } else if (secondFriend.best) {
        return 1;
    }

    return nameRelation;
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
        .sort(sortByNameAndFrendshipType)
        .filter(function (friend) {
            return friend.best;
        });

    var currentDepth = -1;
    if (maxLevel) {
        currentDepth = 0;
    } else {
        maxLevel = Infinity;
    }

    while (friendsToVisit.length > 0) {
        friendsToVisit = friendsToVisit
            .reduce(function (currentFriendsToVisit, currentFriend) {

                var filteredFriends = getFriendsOfFriend(currentFriend, friendsDict)
                    .filter(function (friend) {
                        return (
                            !isArrayContainsFriend(visitedFriends, friend) &&
                            !isArrayContainsFriend(currentFriendsToVisit, friend)
                        );
                    })
                    .sort(sortByNameAndFrendshipType);

                currentFriendsToVisit = currentFriendsToVisit.concat(filteredFriends);

                if (!isArrayContainsFriend(visitedFriends, currentFriend)) {
                    visitedFriends.push(currentFriend);
                }

                if (filter.filter(currentFriend) &&
                    !isArrayContainsFriend(appropriateFriends, currentFriend)) {
                    appropriateFriends.push(currentFriend);
                }

                return currentFriendsToVisit;
            }, []);

        if (currentDepth >= 0) {
            currentDepth++;
        }

        if (currentDepth >= maxLevel) {
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

    this.filter = filter;
    this.done = function () {
        return this.friends.length === 0;
    };
    this.next = function () {
        if (!this.done()) {
            return this.friends.shift();
        }

        return null;
    };
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

    Iterator.call(this, friends, filter, maxLevel);
    // this.maxLevel = maxLevel;
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {

    this.filter = function (friends) {
        return friends;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {

    Filter.call(this);
    this.filter = function (friend) {
        return friend.gender === 'male';
    };
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {

    Filter.call(this);
    this.filter = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
