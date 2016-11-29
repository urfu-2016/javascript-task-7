'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter не является инстансом функции-конструктора Filter');
    }

    friends = (friends instanceof Array) ? friends : [];

    this.currentFriends = [];
    this.otherFriends = [];
    this.filter = filter;

    for (var i = 0; i < friends.length; i++) {
        if (friends[i].best) {
            this.currentFriends.push(friends[i]);
        } else {
            this.otherFriends.push(friends[i]);
        }
    }

    this.currentFriends.sort(compareByName);
    this.friendIndex = 0;
    this.nextFriend = this.getNext();
}

function compareByName(a, b) {
    if (a.name > b.name) {
        return 1;
    }

    if (a.name < b.name) {
        return -1;
    }

    return 0;
}

Iterator.prototype.getNext = function () {
    while (this.currentFriends.length) {
        var friend = this.currentFriends[this.friendIndex];
        this.friendIndex++;

        if (this.friendIndex === this.currentFriends.length) {
            this.currentFriends = getNextFriendsLayer(this.currentFriends, this.otherFriends);
            this.friendIndex = 0;
        }

        if (this.filter.isSuitable(friend)) {
            return friend;
        }
    }

    return null;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return this.nextFriend;
    }

    var oldFriend = this.nextFriend;
    this.nextFriend = this.getNext();

    return oldFriend;
};

Iterator.prototype.done = function () {
    return this.nextFriend === null;
};

function findIndex(collection, callback) {
    for (var i = 0; i < collection.length; i++) {
        if (callback(collection[i])) {
            return i;
        }
    }

    return -1;
}

function getNextFriendsLayer(friendsLayer, otherFriends) {
    var nextFriendsLayer = [];

    friendsLayer.forEach(function (currentFriend) {
        currentFriend.friends.forEach(function (nameFriend) {
            var friendIndex = findIndex(otherFriends, function (item) {
                return item.name === nameFriend;
            });

            if (friendIndex !== -1) {
                nextFriendsLayer.push(otherFriends[friendIndex]);
                otherFriends.splice(friendIndex, 1);
            }
        });
    });

    nextFriendsLayer.sort(compareByName);

    return nextFriendsLayer;
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
    this.maxLevel = (typeof maxLevel === 'number' && !isNaN(maxLevel)) ? maxLevel : 0;
    this.currentLevel = 1;
    Iterator.call(this, friends, filter);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

LimitedIterator.prototype.getNext = function () {
    while (this.currentFriends.length && this.currentLevel <= this.maxLevel) {
        var friend = this.currentFriends[this.friendIndex];
        this.friendIndex++;

        var finish = this.friendIndex === this.currentFriends.length;

        if (finish && this.currentLevel < this.maxLevel) {
            this.currentFriends = getNextFriendsLayer(this.currentFriends, this.otherFriends);
        }

        if (finish) {
            this.friendIndex = 0;
            this.currentLevel++;
        }

        if (this.filter.isSuitable(friend)) {
            return friend;
        }
    }

    return null;
};

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {

    /* Фильтр друзей */

}

Filter.prototype.isSuitable = function () {
    return true;
};

function GenderFilter() {

    /* Фильтр друзей по gender */

}

GenderFilter.prototype = Object.create(Filter.prototype);
GenderFilter.prototype.constructor = GenderFilter;

GenderFilter.prototype.isSuitable = function (item) {
    return item.gender === this.gender;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.gender = 'male';
}

MaleFilter.prototype = Object.create(GenderFilter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.gender = 'female';
}

FemaleFilter.prototype = Object.create(GenderFilter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
