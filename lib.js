'use strict';

function getFilteredFriends(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    var level = maxLevel || Infinity;
    var friendsOfCurrentLevel = friends
        .filter(function (friend) {
            return friend.best;
        })
        .sort(compareFriends);
    var filteredFriends = [];
    var hasInFilteredFriends = function (name) {
        return filteredFriends.some(function (friend) {
            return friend.name === name;
        });
    };
    while (level && friendsOfCurrentLevel.length) {
        filteredFriends = filteredFriends.concat(friendsOfCurrentLevel);
        friendsOfCurrentLevel = friendsOfCurrentLevel
            .reduce(function (namesOfFriends, friend) {
                return namesOfFriends.concat(friend.friends.filter(function (name) {
                    return namesOfFriends.indexOf(name) < 0 && !hasInFilteredFriends(name);
                }));
            }, [])
            .map(function (nameOfFriend) {
                return getObjectOfFriend(nameOfFriend, friends);
            })
            .sort(compareFriends);
        level--;
    }

    return filteredFriends.filter(filter.isFiltered);
}

function compareFriends(firstFriend, secondFriend) {
    return firstFriend.name.localeCompare(secondFriend.name);
}

function getObjectOfFriend(nameOfFriend, friends) {
    var objectOfFriend;
    friends.forEach(function (friend) {
        if (friend.name === nameOfFriend) {
            objectOfFriend = friend;
        }
    });

    return objectOfFriend;
}

function Iterator(friends, filter) {
    this.filteredFriends = getFilteredFriends(friends, filter);
    this.index = 0;
}

Iterator.prototype.done = function () {
    return this.index === this.filteredFriends.length;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.filteredFriends[this.index++];
};

function LimitedIterator(friends, filter, maxLevel) {
    this.index = 0;
    if (!maxLevel || maxLevel < 1) {
        this.filteredFriends = [];

        return;
    }
    this.filteredFriends = getFilteredFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

function Filter() {
    this.isFiltered = function () {
        return true;
    };
}

function MaleFilter() {
    this.isFiltered = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);

function FemaleFilter() {
    this.isFiltered = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
