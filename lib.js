'use strict';
function compareName(personA, personB) {
    if (personA.circle < personB.circle) {
        return personA.circle > personB.circle;
    }

    return personA.name > personB.name;
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
    var friendsList = friends.map(function (entry) {
        return Object.assign({}, entry);
    });
    var a = 0;
    var b = 0;
    friendsList.forEach(function (friend) {
        if (friend.best === true) {
            friend.circle = 1;
            a++;
        }
    });
    var circle = 1;
    while (a !== b) {
        a = b;
        aaa(friendsList, circle);
        b = bbb(friendsList);
        circle++;
    }

    this.friends = friendsList.filter(function (friend) {
        return filter.rightGender(friend.gender);
    }).sort(compareName);
}

function aaa(friendsList, circle) {
    friendsList.forEach(function (friend) {
        if (friend.circle === circle) {
            friend.friends.forEach(function (name) {
                friendsList.forEach(function (friend1) {
                    if (friend1.name === name && friend1.circle === undefined) {
                        friend1.circle = circle + 1;
                    }
                });
            });
        }
    });
}

function bbb(friendsList) {
    var count = 0;
    friendsList.forEach(function (friend) {
        if (friend.circle !== undefined) {
            count++;
        }
    });

    return count;
}


Iterator.prototype.done = function () {
    this.friends = this.friends.filter(function (friend) {
        return friend.circle !== undefined;
    });

    return (checkDone(this.friends));
};
Iterator.prototype.next = function () {
    this.friends = this.friends.filter(function (friend) {
        return friend.circle !== undefined;
    });
    if (checkDone(this.friends)) {
        return null;
    }
    delete this.friends[0].circle;

    return this.friends[0];
};

function checkDone(friends) {
    var count = friends.length;

    return !(count !== 0);
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
    Iterator.call(this, friends, filter);

    this.friends = this.friends.filter(function (friend) {
        return friend.circle <= maxLevel;
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.rightGender = function () {

        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.rightGender = function (gender) {
        return gender === 'male';
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
    this.rightGender = function (gender) {
        return gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
