'use strict';

function getFriendByName(name, friends) {
    return friends.filter(function (friend) {
        return friend.name === name;
    })[0];
}

function getInvitedFriends(friends) {
    var currentFriendsCircle = friends.filter(function (friend) {
        return friend.best;
    });
    var result = [];
    var currentLevel = 1;
    var friendsNames = [];
    while (currentFriendsCircle.length !== 0) {
        var nextLevelNames = [];
        currentFriendsCircle = currentFriendsCircle.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        for (var i = 0; i < currentFriendsCircle.length; i++) {
            var friend = currentFriendsCircle[i];
            result.push({
                level: currentLevel,
                friend: friend
            });
            friendsNames.push(friend.name);
            nextLevelNames = nextLevelNames.concat(friend.friends);
        }
        currentFriendsCircle = nextLevelNames.filter(function (name) {
            return friendsNames.indexOf(name) === -1;
        })
        .map(function (name) {
            return getFriendByName(name, friends);
        });
        currentLevel++;
    }

    return result;
}

 /**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('no filter');
    }
    this.invitedFriends = getInvitedFriends(friends)
    .filter(function (item) {
        return filter.test(item.friend);
    });

    this.index = 0;
}

Iterator.prototype.done = function () {
    return this.invitedFriends.length <= this.index;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.invitedFriends[this.index++].friend;
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

    this.invitedFriends = this.invitedFriends.filter(function (item) {
        return item.level <= maxLevel;
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.test = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.test = function (item) {
        return item.gender === 'male';
    };
}
MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.test = function (item) {
        return item.gender === 'female';
    };
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
