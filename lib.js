'use strict';

function friendsABCComparator(f1, f2) {

    return f1.name.localeCompare(f2.name);
}

function findFriend(friends, name) {
    for (var index = 0; index < friends.length; index++) {
        if (friends[index].name === name) {

            return friends[index];
        }
    }
}

function getFriendsCircle(currCircle, friends) {
    var friendsCircle = [];
    var friendNames = currCircle.map(function (friend) {

        return friend.friends;
    });

    friendNames.forEach(function (nameArray) {
        nameArray.forEach(function (name) {
            var friend = findFriend(friends, name);
            if (friendsCircle.indexOf(friend) === -1) {
                friendsCircle.push(findFriend(friends, name));
            }
        });
    });

    return friendsCircle;
}


function getFriendsUpToCircle(friends, filter, limitCircle) {
    var invitedFriends = [];
    var currCircle = friends.filter(function (friend) {

        return friend.best === true;
    }).sort(friendsABCComparator);
    function notInList(friend) {

        return invitedFriends.indexOf(friend) === -1;

    }
    while (currCircle.length !== 0) {
        if (limitCircle !== undefined && limitCircle <= 0) {
            break;
        }
        if (limitCircle) {
            limitCircle--;
        }
        invitedFriends = invitedFriends.concat(currCircle);
        var currFriendsCircle = getFriendsCircle(currCircle, friends);
        currCircle = currFriendsCircle.filter(notInList).sort(friendsABCComparator);
    }

    return invitedFriends.filter(filter.query);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this._invitedFriends = getFriendsUpToCircle(friends, filter);
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
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this._invitedFriends = getFriendsUpToCircle(friends, filter, maxLevel);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.query = function () {

        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.query = function (friend) {

        return friend.gender === 'male';
    };
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.query = function (friend) {

        return friend.gender === 'female';
    };
}


MaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype = Object.create(Filter.prototype);
Iterator.prototype.done = function () {

    return this._current === this._invitedFriends.length;
};
Iterator.prototype.next = function () {
    if (this._current === undefined) {
        this._current = 0;
    }

    return this.done() ? null : this._invitedFriends[this._current++];
};
LimitedIterator.prototype = Object.create(Iterator.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
