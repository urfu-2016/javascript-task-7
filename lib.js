'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
var Iterator = function (friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new Error('filter has not instance - Filter');
    }

    this.__friends = [];
    friends.forEach(this.deepCopy, this);
    this.__filter = filter;
    this.__currentFriendName = 0;
    this.__currentIndex = -1;
    this.__currentFriendsCircle = [];
    this.__suitableFriends = [];
    this.__indexOfFoundedFriend = -1;
    this.selectSuitableFriends(filter);
};

Iterator.prototype.deepCopy = function (friend, i) {
    this.__friends[i] = {};
    for (var prop in friend) {
        if (!friend.hasOwnProperty(prop)) {
            continue;
        }

        this.__friends[i][prop] = friend[prop];
    }
};

Iterator.prototype.selectSuitableFriends = function (filter) {
    this.pushBestFriends(filter);
    this.increaseLevelNumber();
    this.passFriendsCircle(this.__currentFriendsCircle);
};

Iterator.prototype.pushBestFriends = function (filter) {
    for (var i = 0; i < this.__friends.length; i++) {
        filter.setCurrentFriend(this.__friends[i]);
        if (!filter.isBestFriend()) {
            continue;
        }

        if (filter.isFriendSuit()) {
            this.__suitableFriends.push(this.__friends[i]);
        }

        this.__currentFriendsCircle.push(this.__friends[i]);
        this.deleteFriendByIndex(i);
        i--;
    }
};

Iterator.prototype.increaseLevelNumber = function () {
    this.__numberCurrentLevel++;
};

Iterator.prototype.passFriendsCircle = function (friends) {
    if (this.isLastLevel() || this.isCircleEmpty()) {
        return;
    }

    friends.sort(this.sortFriendsCircleByName);
    this.clearFriendsCircle();

    friends.forEach(this.passFriendsOfFriend, this);

    this.increaseLevelNumber();
    this.passFriendsCircle(this.__currentFriendsCircle);
};

Iterator.prototype.sortFriendsCircleByName = function (friend1, friend2) {
    if (friend1.name > friend2.name) {
        return 1;
    }

    if (friend1.name < friend2.name) {
        return -1;
    }

    return 0;
};

Iterator.prototype.clearFriendsCircle = function () {
    this.__currentFriendsCircle = [];
};

Iterator.prototype.passFriendsOfFriend = function (currentFriend) {
    for (var j = 0; j < currentFriend.friends.length; j++) {
        this.__indexOfFoundedFriend = -1;
        this.setCurrentFriendName(currentFriend.friends[j]);
        var foundedFriend = this.__friends.find(this.findFriendByName, this);

        if (!foundedFriend) {
            continue;
        }

        this.deleteFriendByIndex(this.__indexOfFoundedFriend);
        this.__filter.setCurrentFriend(foundedFriend);
        if (this.__filter.isFriendSuit()) {
            this.__suitableFriends.push(foundedFriend);
        }
        this.__currentFriendsCircle.push(foundedFriend);
    }
};

Iterator.prototype.setCurrentFriendName = function (friendName) {
    this.__currentFriendName = friendName;
};

Iterator.prototype.getCurrentFriendName = function () {
    return this.__currentFriendName;
};

Iterator.prototype.findFriendByName = function (friend, x) {
    if (friend.name === this.__currentFriendName) {
        this.__indexOfFoundedFriend = x;

        return true;
    }

    return false;
};

Iterator.prototype.deleteFriendByIndex = function (index) {
    this.__friends.splice(index, 1);
};

Iterator.prototype.isCircleEmpty = function () {
    return !this.__currentFriendsCircle.length;
};

Iterator.prototype.isLastLevel = function () {
    return this.__maxLevel === this.__numberCurrentLevel;
};

Iterator.prototype.done = function () {
    return this.__currentIndex + 1 === this.__suitableFriends.length;
};

Iterator.prototype.next = function () {
    this.__currentIndex++;

    return this.__suitableFriends[this.__currentIndex] || null;
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
    if (!(filter instanceof Filter)) {
        throw new Error('filter has not instance - Filter');
    }

    this.__friends = [];
    friends.forEach(this.deepCopy, this);
    this.__currentFriend = 0;
    this.__currentIndex = -1;
    this.__currentFriendsCircle = [];
    this.__suitableFriends = [];
    this.__filter = filter;
    this.__maxLevel = maxLevel;
    this.__numberCurrentLevel = 0;
    this.selectSuitableFriends(filter);
}

LimitedIterator.prototype.isLastLevel = function () {
    return this.__maxLevel === this.__numberCurrentLevel;
};

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.__filterFunction = null;
}

Filter.prototype.setCurrentFriend = function (friend) {
    this.__currentFriend = friend;
};

Filter.prototype.getCurrentFriend = function () {
    return this.__currentFriend;
};

Filter.prototype.isFriendSuit = function () {
    return this.__filterFunction();
};

Filter.prototype.isBestFriend = function () {
    return this.__currentFriend.best;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.__filterFunction = function () {
        return this.__currentFriend.gender === 'male';
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
    this.prototype = Object.create(Filter.prototype);
    this.__filterFunction = function () {
        return this.__currentFriend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;
exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
