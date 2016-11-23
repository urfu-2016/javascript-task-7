'use strict';

function Set() {
    this.elements = {};
    this.add = function (value) {
        this.elements[value] = true;
    };
    this.contains = function (value) {
        return this.elements.hasOwnProperty(value);
    };
}

function compareBy(propertyName) {
    return function (first, second) {
        if (first[propertyName] < second[propertyName]) {
            return -1;
        }
        if (first[propertyName] > second[propertyName]) {
            return 1;
        }

        return 0;
    };
}

function convertToMapBy(propertyName, objectArray) {
    return objectArray.reduce(function (currentMap, object) {
        currentMap[object[propertyName]] = object;

        return currentMap;
    }, {});
}

function IteratorByCircle(friends) {
    this.nameToFriend = convertToMapBy('name', friends);
    this.namesOfInvited = new Set();
    this.currentCircle = [];
    this.nextCircle = [];

    var bestFriends = friends.filter(function (friend) {
        return friend.best;
    }).sort(compareBy('name'));
    bestFriends.forEach(this.pushNextIfPossible, this);
}

IteratorByCircle.prototype.pushNextIfPossible = function (friend) {
    if (!this.namesOfInvited.contains(friend.name)) {
        this.namesOfInvited.add(friend.name);
        this.nextCircle.push(friend);
    }
};

IteratorByCircle.prototype.moveToNextCircle = function () {
    this.currentCircle = this.nextCircle.sort(compareBy('name'));
    this.nextCircle = [];
};

IteratorByCircle.prototype.next = function () {
    if (this.currentCircle.length === 0 && this.nextCircle.length === 0) {
        return null;
    }
    if (this.done()) {
        return null;
    }

    if (this.currentCircle.length === 0) {
        this.moveToNextCircle();
    }

    var nextFriend = this.currentCircle.shift();
    nextFriend.friends.map(function (name) {
        return this.nameToFriend[name];
    }, this)
    .forEach(this.pushNextIfPossible, this);

    return nextFriend;
};

IteratorByCircle.prototype.done = function () {
    return this.currentCircle.length === 0 &&
           this.nextCircle.length === 0;
};

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Argument "filter" should be instance of Filter');
    }

    IteratorByCircle.call(this, friends);
    this.filter = filter;
    this.current = undefined;
    this.next();
}
Iterator.prototype = Object.create(IteratorByCircle.prototype);

Iterator.prototype.next = function () {
    if (this.done()) {
        this.current = null;

        return null;
    }

    for (;;) {
        var next = IteratorByCircle.prototype.next.call(this);
        if (next === null || this.filter.isAccept(next)) {
            var lastCurrent = this.current;
            this.current = next;

            return lastCurrent;
        }
    }
};

Iterator.prototype.done = function () {
    return IteratorByCircle.prototype.done.call(this) && this.current === null;
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
    this.currentLevel = 0;
    this.maxLevel = maxLevel;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

LimitedIterator.prototype.done = function () {
    return Iterator.prototype.done.call(this) ||
    this.currentLevel >= this.maxLevel ||
    this.maxLevel <= 0;
};

LimitedIterator.prototype.moveToNextCircle = function () {
    Iterator.prototype.moveToNextCircle.call(this);
    this.currentLevel++;
};


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isAccept = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isAccept = function (friend) {
        return friend.gender === 'male';
    };
}
MaleFilter.prototype = Object.create(Filter.prototype);


/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isAccept = function (friend) {
        return friend.gender === 'female';
    };
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.IteratorByCircle = IteratorByCircle;
exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
