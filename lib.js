'use strict';

var MAX_DEPTH = 99999999;

function extend(Child, Parent) {
    var F = function () {
        // do nothing
    };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

function markDepthOfSubFriends(friend, indexedFriends, indexedFriendsNames, currentIndex) {
    friend.friends.sort().forEach(function (friendName) {
        var subFriend = indexedFriends[friendName];
        subFriend.level = Math.min(subFriend.level, friend.level + 1, currentIndex);
        if (indexedFriendsNames.indexOf(friendName) > -1) {
            return;
        }
        indexedFriendsNames.push(friendName);
        markDepthOfSubFriends(subFriend, indexedFriends, indexedFriendsNames, currentIndex + 1);
    });
}

function indexFriends(friends) {
    var indexedFriends = {};
    var bestFriends = [];
    var indexedFriendsNames = [];
    friends.forEach(function (friend) {
        friend.level = friend.best ? 1 : MAX_DEPTH;
        indexedFriends[friend.name] = friend;
        if (friend.best) {
            bestFriends.push(friend);
        }
    });
    bestFriends.sort(function (first, second) {
        return first.name > second.name ? 1 : -1;
    }).forEach(function (friend) {
        markDepthOfSubFriends(friend, indexedFriends, indexedFriendsNames, 2);
    });

    return Object.keys(indexedFriends).map(function (key) {
        return indexedFriends[key];
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
        throw new TypeError('It is not instance of Filter');
    }
    this.currentDepth = 0;
    this.friends = indexFriends(friends)
        .filter(function (friend) {
            return friend.level > 0 && friend.level < MAX_DEPTH && filter.apply(friend);
        })
        .sort(function (first, second) {
            if (first.level === second.level) {
                return first.name > second.name ? 1 : -1;
            }

            return first.level > second.level ? 1 : -1;
        });
}

Iterator.prototype.done = function () {
    return this.currentDepth === this.friends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.friends[this.currentDepth++];
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

    this.friends = this.friends.filter(function (friendWithLevel) {
        return friendWithLevel.level <= maxLevel;
    });
}

// LimitedIterator.prototype = Object.create(Iterator.prototype);
extend(LimitedIterator, Iterator);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.comparator = function () {
        return true;
    };
}

Filter.prototype.apply = function () {
    return this.comparator.apply(null, arguments);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.comparator = function (friend) {
        return friend.gender === 'male';
    };
}
extend(MaleFilter, Filter);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.comparator = function (friend) {
        return friend.gender === 'female';
    };
}
extend(FemaleFilter, Filter);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;
exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
