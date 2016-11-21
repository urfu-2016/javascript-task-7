'use strict';

function findNote(friends, name) {
    var newFriend;
    friends.forEach(function (friend) {
        if (friend.name === name) {
            newFriend = friend;
        }
    });

    return newFriend;
}

function makeIterationArray(friendsCircles, filter, maxLevel) {
    var iterationArray = [];

    friendsCircles.slice(0, Math.max(maxLevel, 0)).forEach(function (circle) {
        circle.forEach(function (friend) {
            if (filter.choose(friend)) {
                iterationArray.push(friend);
            }
        });
    });

    return iterationArray;
}

function makeFriendsCircles(friends) {
    var friendsCircles = [[]];
    var usedFriends = [];

    function makeNewCircle(i) {
        var newCircle = [];
        friendsCircles[i].forEach(function (friend) {
            friend.friends.forEach(function (name) {
                if (usedFriends.indexOf(name) === -1) {
                    usedFriends.push(name);
                    newCircle.push(findNote(friends, name));
                }
            });
        });

        if (newCircle.length !== 0) {
            friendsCircles.push(newCircle);
        }
    }

    friends.forEach(function (friend) {
        if (friend.best === true) {
            friendsCircles[0].push(friend);
            usedFriends.push(friend.name);
        }
    });

    for (var i = 0; i < friendsCircles.length; i++) {
        makeNewCircle(i);
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

    this.friendsCircles = makeFriendsCircles(friends);
    this.maxLevel = this.friendsCircles.length;
    this.iterationArray = makeIterationArray(this.friendsCircles, filter, this.maxLevel);
    this.numberOfCalls = 0;

    this.done = function () {
        return this.numberOfCalls === this.iterationArray.length;
    };

    this.next = function () {
        if (this.done()) {
            return null;
        }

        this.numberOfCalls++;

        return this.iterationArray[this.numberOfCalls - 1];
    };
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
    this.iterationArray = makeIterationArray(this.friendsCircles, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.choose = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.choose = function (friend) {
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
    this.choose = function (friend) {
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
