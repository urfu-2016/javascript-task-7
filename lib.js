'use strict';

function hasInFilteredFriends(filteredFriends, name) {
    return filteredFriends.some(function (friend) {
        return friend.name === name;
    });
}

function compareFriendsByName(firstFriend, secondFriend) {
    return firstFriend.name.localeCompare(secondFriend.name);
}

function getObjectOfFriend(friends, nameOfFriend) {
    for(var i = 0; i < friends.length; i++) {
        if (friends[i].name === nameOfFriend) {
            return friends[i];
        }
    }
}

function isBestFriend(friend) {
    return friend.best;
}

function getFilteredFriends(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    var level = maxLevel || Infinity;
    var friendsOfCurrentLevel = friends
        .filter(isBestFriend)
        .sort(compareFriendsByName);
    var filteredFriends = [];
    while (level && friendsOfCurrentLevel.length) {
        filteredFriends = filteredFriends.concat(friendsOfCurrentLevel);
        friendsOfCurrentLevel = friendsOfCurrentLevel
            .reduce(function (namesOfFriends, friend) {
                return namesOfFriends.concat(friend.friends.filter(function (name) {
                    return namesOfFriends.indexOf(name) < 0 &&
                        !hasInFilteredFriends(filteredFriends, name);
                }));
            }, [])
            .map(getObjectOfFriend.bind(null, friends))
            .sort(compareFriendsByName);
        level--;
    }

    return filteredFriends.filter(filter.isFiltered);
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

function GenderFilter(gender) {
    this.isFiltered = function (friend) {
        return friend.gender === gender;
    }
}
GenderFilter.prototype = Object.create(Filter.prototype);

function MaleFilter() {
    GenderFilter.call(this, 'male');
}
MaleFilter.prototype = Object.create(GenderFilter.prototype);

function FemaleFilter() {
    GenderFilter.call(this, 'female');
}
FemaleFilter.prototype = Object.create(GenderFilter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
