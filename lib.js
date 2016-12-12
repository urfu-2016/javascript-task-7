'use strict';

/**
 * Сортировка по алфавиту, с учетом круга знакомства
 * @param {Object} personA - первый друг
 * @param {Object} personB - второй друг
 * @returns {Boolean}
 */
function compareName(personA, personB) {
    return personA.name > personB.name;
}

function compareCircle(personA, personB) {
    return personA.circle > personB.circle;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter is not instance of Filter');
    }

    var friendWithCircleBefore = 0;
    var friendWithCircleAfter = 0;
    friends.forEach(function (friend) {
        if (friend.best === true) {
            friend.circle = 1;
            friendWithCircleBefore++;
        }
    });
    var circle = 1;
    while (friendWithCircleBefore !== friendWithCircleAfter) {
        friendWithCircleBefore = friendWithCircleAfter;
        friendWithCircleAfter = setAndCheckCircle(friends, circle);
        circle++;
    }

    this.friends = friends.filter(function (friend) {
        return filter.rightGender(friend.gender);
    }).filter(function (friend) {
        return friend.circle !== undefined;
    })
        .sort(compareName)
        .sort(compareCircle);
}

/**
 * Присвоение следующего круга знакомства + подсчёт друзей, которым он уже задан
 * @param {Object} friendsList - первый друг
 * @param {Number} circle - второй друг
 * @returns {Number} count - кол-во друзей, с заданым кругом знакомства
 */
function setAndCheckCircle(friendsList, circle) {
    var count = 0;
    friendsList.forEach(function (friend) {
        if (friend.circle !== undefined) {
            count++;
        }
        if (friend.circle === circle) {
            friend.friends.forEach(function (name) {
                friendsList.forEach(function (someFriend) {
                    if (someFriend.name === name && someFriend.circle === undefined) {
                        someFriend.circle = circle + 1;
                    }
                });
            });
        }
    });

    return count;
}

Iterator.prototype.done = function () {
    this.friends = this.friends.filter(function (friend) {
        return friend.circle !== undefined;
    });

    return (this.friends.length === 0);
};
Iterator.prototype.next = function () {
    this.friends = this.friends.filter(function (friend) {
        return friend.circle !== undefined;
    });
    if (this.friends.length === 0) {
        return null;
    }
    delete this.friends[0].circle;

    return this.friends[0];
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
    maxLevel = maxLevel > 0 ? maxLevel : 0;
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
