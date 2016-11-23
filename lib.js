'use strict';

function friendsABCComparator(f1, f2) {

    return f1.name.localeCompare(f2.name);
}

function getFriendsCircle(currCircle, friendsDict) {
    var friendsCircle = [];
    currCircle.forEach(function (friend) {
        friend.friends.forEach(function (name) {
            if (friendsCircle.indexOf(friendsDict[name]) === -1) {
                friendsCircle.push(friendsDict[name]);
            }
        });
    });

    return friendsCircle;
}

function makeFriendsDict(friends) {
    var friendsDict = {};
    friends.forEach(function (friend) {
        friendsDict[friend.name] = friend;
    });

    return friendsDict;
}

function getFriendsUpToCircle(friends, filter, limitCircle) {
    var friendsDict = makeFriendsDict(friends);
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
        var currFriendsCircle = getFriendsCircle(currCircle, friendsDict);
        currCircle = currFriendsCircle.filter(notInList).sort(friendsABCComparator);
    }

    return invitedFriends.filter(function (friend) {
        return filter.isApropToQuery(friend);
    });
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of Filter');
    }
    this._current = 0;
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
        throw new TypeError('Not instance of Filter');
    }
    this._current = 0;
    this._invitedFriends = getFriendsUpToCircle(friends, filter, maxLevel);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this._query = function () {

        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this._query = function (friend) {

        return friend.gender === 'male';
    };
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this._query = function (friend) {

        return friend.gender === 'female';
    };
}

function inherit(obj, parent) {
    obj.prototype = Object.create(parent.prototype);
    obj.prototype.constructor = obj;
}

Filter.prototype.isApropToQuery = function (obj) {
    return this._query(obj);
};


inherit(MaleFilter, Filter);
inherit(FemaleFilter, Filter);
Iterator.prototype.done = function () {

    return this._current === this._invitedFriends.length;
};

Iterator.prototype.next = function () {

    return this.done() ? null : this._invitedFriends[this._current++];
};
inherit(LimitedIterator, Iterator);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
