'use strict';

/**
 * Ищет запись с именем name во friends
 * @param {Object[]} friends
 * @param {String} name
 * @returns {Object} friend
 */
function findFriend(friends, name) {
    return friends.find(function (friend) {
        return friend.name === name;
    });
}

/**
 * Из массива с кругами создает массив для итерации, фильтруя неподходящие записи
 * @param {Array} friendsCircles
 * @param {Filter} filter
 * @returns {Array} iterationArray
 */
function makeIterationArray(friendsCircles, filter) {
    return friendsCircles.reduce(function (iterationArray, currentCircle) {
        return iterationArray.concat(currentCircle.filter(function (friend) {
            return filter.isFitting(friend);
        }));
    }, []);
}

/**
 * Возвращает круг под номером circleNumber, записывает данные в usedFriends
 * @param {Integer} circleNumber
 * @param {Array} usedFriends
 * @param {Array} friendsCircles
 * @param {Object[]} friends
 * @returns {Array} circle
 */
function makeCircle(circleNumber, usedFriends, friendsCircles, friends) {
    var circle = [];
    friendsCircles[circleNumber - 1].forEach(function (friend) {
        friend.friends.forEach(function (name) {
            if (usedFriends.indexOf(name) === -1) {
                usedFriends.push(name);
                circle.push(findFriend(friends, name));
            }
        });
    });

    return circle;
}

/**
 * Возвращает массив кругов с максимальным уровнем maxLevel
 * @param {Object[]} friends
 * @param {Integer} maxLevel
 * @returns {Array} friendsCircles
 */
function makeFriendsCircles(friends, maxLevel) {
    var friendsCircles = [[]];
    var usedFriends = [];
    if (maxLevel > 0) {
        friends.forEach(function (friend) {
            if (friend.best === true) {
                friendsCircles[0].push(friend);
                usedFriends.push(friend.name);
            }
        });

        var circleNumber = 1;
        var newCircle = makeCircle(circleNumber, usedFriends, friendsCircles, friends);

        while (newCircle.length && circleNumber < maxLevel) {
            friendsCircles.push(newCircle);
            circleNumber++;
            newCircle = makeCircle(circleNumber, usedFriends, friendsCircles, friends);
        }
    }

    friendsCircles.forEach(function (circle) {
        circle.sort(function (firstPerson, secondPerson) {
            return firstPerson.name > secondPerson.name ? 1 : -1;
        });
    });

    return friendsCircles;
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
    this.friendsCircles = makeFriendsCircles(friends, Infinity);
    this.iterationArray = makeIterationArray(this.friendsCircles, filter);
    this.numberOfCalls = 0;
}

Iterator.prototype.done = function () {
    return this.numberOfCalls === this.iterationArray.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    this.numberOfCalls++;

    return this.iterationArray[this.numberOfCalls - 1];
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
        throw new TypeError('filter is not instance of Filter');
    }
    this.friendsCircles = makeFriendsCircles(friends, maxLevel);
    this.iterationArray = makeIterationArray(this.friendsCircles, filter);
    this.numberOfCalls = 0;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isFitting = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isFitting = function (friend) {
        return friend.gender === 'male';
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
    this.isFitting = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
