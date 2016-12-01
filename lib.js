'use strict';


function sortNameFriends(a, b) {
    return a.name > b.name ? 1 : -1;
}

function friendOnName(name, friends) {
    var filtred = friends.filter(function (friend) {
        return (friend.name === name);
    });

    return filtred[0];
}

function isNotInvited(friendName, invitedFriends, namesNewInvitedFriends) {
    var invitedFriendsNames = invitedFriends.map(function (friend) {
        return friend.name;
    });

    return (invitedFriendsNames.indexOf(friendName) === -1) &&
        (namesNewInvitedFriends.indexOf(friendName) === -1);
}

function addCircleFriends(invitedFriends, friends) {
    var namesNewInvitedFriends = [];
    invitedFriends.forEach(function (invitedFriend) {
        namesNewInvitedFriends = namesNewInvitedFriends.concat(
            invitedFriend.friends.filter(function (friend) {
                return isNotInvited(friend, invitedFriends, namesNewInvitedFriends);
            })
        );
    });
    var newInvitedFriends = namesNewInvitedFriends.map(function (name) {
        return (friendOnName(name, friends));
    });
    newInvitedFriends.sort(sortNameFriends);

    return newInvitedFriends;
}

function sortFriends(friends, countCircles) {
    if (countCircles === undefined) {
        countCircles = Number.POSITIVE_INFINITY;
    }
    var invitedFriends = friends.filter(function (friend) {
        return friend.hasOwnProperty('best');
    });
    invitedFriends.sort(sortNameFriends);
    countCircles--;
    while (countCircles > 0) {
        var newInvited = addCircleFriends(invitedFriends, friends);
        if (newInvited.length === 0) {
            break;
        }
        invitedFriends = invitedFriends.concat(newInvited);
        countCircles--;
    }

    return invitedFriends;
}

function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this.filtredFriends = sortFriends(friends).filter(filter.isApproach);
    this.enumerator = 0;
}

Iterator.prototype.done = function () {
    return (this.filtredFriends.length === this.enumerator);
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    this.enumerator++;

    return this.filtredFriends[this.enumerator - 1];
};

function LimitedIterator(friends, filter, maxLevel) {
    this.filtredFriends = sortFriends(friends, maxLevel).filter(filter.isApproach);
    this.enumerator = 0;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isApproach = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isApproach = function (friend) {
        return friend.gender === 'male';
    };
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isApproach = function (friend) {
        return friend.gender === 'female';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
