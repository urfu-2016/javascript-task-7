'use strict';

var MAX_DEPTH = Number.MAX_VALUE;

function extend(Child, Parent) {
    Child.prototype = Object.create(Parent.prototype);
}

function sortByName(a, b) {
    return a.name > b.name ? 1 : -1;
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
        if (friend.best) {
            friend.level = 1;
            bestFriends.push(friend);
        } else {
            friend.level = MAX_DEPTH;
        }
        indexedFriends[friend.name] = friend;
    });
    bestFriends.sort(sortByName)
    .forEach(function (friend) {
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
    this.currentIteration = 0;
    this.friends = indexFriends(friends)
        .filter(function (friend) {
            return friend.level > 0 && friend.level < MAX_DEPTH && filter.use(friend);
        })
        .sort(function (first, second) {
            if (first.level === second.level) {
                return sortByName(first, second);
            }

            return Math.sign(first.level - second.level);
        });
}

Iterator.prototype.done = function () {
    return this.currentIteration === this.friends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.friends[this.currentIteration++];
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

extend(LimitedIterator, Iterator);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.comparator = '';
}


Filter.prototype.use = function (friend) {
    if (this.comparator === '') {
        return true;
    }

    var genderResolve = friend.gender.indexOf(this.comparator);

    return genderResolve > -1 && genderResolve !== 2;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.comparator = 'male';
}
extend(MaleFilter, Filter);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.comparator = 'female';
}
extend(FemaleFilter, Filter);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;
exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
