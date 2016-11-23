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

    this.currentFriends = [];
    this.otherFriends = [];
    this.filter = filter;

    friends.forEach(function (friend) {
        if (friend.hasOwnProperty('best') {
            this.currentFriends.push(friend);
        } else {
            this.otherFriends.push(friend);
        }
    }, this);

    this.currentFriends.sort(compare);
    this.nextFriend = this.getNext();
}

function compare(a, b) {
    if (a.name > b.name) {
        return 1;
    }

    if (a.name < b.name) {
        return -1;
    }

    return 0;
}

Iterator.prototype.getNext = (function () {
    var friendIndex = 0;

    return function () {
        while (this.currentFriends.length) {
            var friend = this.currentFriends[friendIndex];
            friendIndex++;

            if (friendIndex === this.currentFriends.length) {
                this.currentFriends = getNextLevel(this.otherFriends, this.currentFriends);
                friendIndex = 0;
            }

            if (this.filter.isSuitable(friend)) {
                return friend;
            }
        }

        return null;
    };
}());

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
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

function getNextLevel(otherFriends, level) {
    var nextLevel = [];

    for (var i = 0; i < level.length; i++) {
        var currentFriend = level[i];
        currentFriend.friends.forEach(function (nameFriend) {
            var friendIndex = findIndex(otherFriends, function (item) {
                return item.name === nameFriend;
            });

            if (friendIndex !== -1 && nextLevel.indexOf(otherFriends[friendIndex] === -1)) {
                nextLevel.push(otherFriends[friendIndex]);
                otherFriends.splice(friendIndex, 1);
            }
        });
    }

    nextLevel.sort(compare);

    return nextLevel;
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
    this.maxLevel = maxLevel;
    Iterator.call(this, friends, filter);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

LimitedIterator.prototype.getNext = (function () {
    var friendIndex = 0;
    var currentLevel = 1;

    return function () {
        while (this.currentFriends.length && currentLevel <= this.maxLevel) {
            var friend = this.currentFriends[friendIndex];
            friendIndex++;

            var finish = friendIndex === this.currentFriends.length;

            if (finish && currentLevel < this.maxLevel) {
                this.currentFriends = getNextLevel(this.otherFriends, this.currentFriends);
            }

            if (finish) {
                friendIndex = 0;
                currentLevel++;
            }

            if (this.filter.isSuitable(friend)) {
                return friend;
            }
        }

        return null;
    };
}());


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.nothing = 'nothing';
}

Filter.prototype.isSuitable = function () {
    return true;
};

function GenderFilter() {
    this.gender = 'nothing';
}

GenderFilter.prototype = Object.create(Filter.prototype);
GenderFilter.prototype.constructor = GenderFilter;

GenderFilter.prototype.isSuitable = function (item) {
    return item.hasOwnProperty('gender') && item.gender === this.gender;
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
