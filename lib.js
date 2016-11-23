'use strict';

function contains(array, item) {
    return array.indexOf(item) !== -1;
}

function sortByName(one, other) {
    if (one.name < other.name) {
        return -1;
    }

    return one.name > other.name;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter should be instance of Filter');
    }

    this._getInvitees = function (maxLevel) {
        if (typeof(maxLevel) !== 'number' || maxLevel <= 0) {
            return [];
        }

        var visited = [];
        var currentDepth = 1;
        var friendsToVisit = friends
            .filter(function (friend) {
                return friend.best;
            })
            .sort(sortByName);

        while (friendsToVisit.length !== 0) {
            friendsToVisit = friendsToVisit.reduce(function (acc, friendToVisit, index, arr) {
                visited.push(friendToVisit);
                var notVisited = getFriendsOf(friendToVisit, friends)
                    .filter(function (potentialFriend) {
                        return !contains(arr, potentialFriend) &&
                            !contains(visited, potentialFriend);
                    })
                    .sort(sortByName);

                return acc.concat(notVisited);
            }, []);

            if (++currentDepth > maxLevel) {
                break;
            }
        }

        return visited.filter(function (visitedFriend) {
            return filter.filter(visitedFriend);
        });
    };

    function getFriendsOf(friend) {
        return friend.friends
            .map(function (friendName) {
                return getFriendWithName(friendName, friends);
            });
    }

    function getFriendWithName(name) {
        for (var i = 0; i < friends.length; i++) {
            var friend = friends[i];
            if (friend.name === name) {
                return friend;
            }
        }
    }

    this._invitedFriends = this._getInvitees(Infinity);
    this._currentFriendCount = 0;

    this.done = function () {
        return this._currentFriendCount === this._invitedFriends.length;
    };

    this.next = function () {
        return this.done() ? null : this._invitedFriends[this._currentFriendCount++];
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
    this._invitedFriends = this._getInvitees(maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isSuitable = function () {
        return true;
    };

    this.filter = function (person) {
        return this.isSuitable(person);
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Filter.call(this);

    this.isSuitable = function (person) {
        return person.gender === 'male';
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
    Filter.call(this);

    this.isSuitable = function (person) {
        return person.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
