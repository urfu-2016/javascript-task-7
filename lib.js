'use strict';

/* eslint no-empty-function: ["off"] */

function contains(array, item) {
    return array.indexOf(item) !== -1;
}

function sortByName(one, other) {
    if (one.name === other.name) {
        return 0;
    }

    return one.name > other.name ? 1 : -1;
}

function getFriendsOf(friend, friends) {
    return friend.friends
        .map(function (friendName) {
            return getFriendByName(friendName, friends);
        });
}

function getFriendByName(name, friends) {
    for (var i = 0; i < friends.length; i++) {
        var friend = friends[i];
        if (friend.name === name) {
            return friend;
        }
    }
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
        var visitedFriends = [];
        var friendsToVisit = friends.filter(function (friend) {
            return friend.best;
        });

        function isNotVisited(friend) {
            return !contains(visitedFriends, friend);
        }

        while (maxLevel-- > 0 && friendsToVisit.length !== 0) {
            friendsToVisit.sort(sortByName);
            visitedFriends = visitedFriends.concat(friendsToVisit);
            friendsToVisit = friendsToVisit.reduce(function (acc, currentFriend) {
                var notVisited = getFriendsOf(currentFriend, friends).filter(function (friend) {
                    return isNotVisited(friend) && !contains(acc, friend);
                });

                return acc.concat(notVisited);
            }, []);
        }

        return visitedFriends.filter(filter.filterPerson);
    };

    this._currentFriendCount = 0;
    if (!(Object.getPrototypeOf(this) instanceof Iterator)) {
        this._invitedFriends = this._getInvitees(Infinity);
    }
}

Iterator.prototype.done = function () {
    return this._currentFriendCount === this._invitedFriends.length;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this._invitedFriends[this._currentFriendCount++];
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
    this._invitedFriends = this._getInvitees(maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {}

Filter.prototype.filterPerson = function () {
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
MaleFilter.prototype.filterPerson = function (person) {
    return person.gender === 'male';
};

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;
FemaleFilter.prototype.filterPerson = function (person) {
    return person.gender === 'female';
};

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
