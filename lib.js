'use strict';

/* eslint no-empty-function: ["error", { "allow": ["functions"] }]*/

function sortByName(firstName, secondName) {
    if (firstName === secondName) {
        return 0;
    }

    return firstName > secondName ? 1 : -1;
}

function getFriend(friends, name) {
    return friends.filter(function (friend) {
        return friend.name === name;
    })[0];
}

function getBestFriendsNames(friends) {
    return friends
        .filter(function (friend) {
            return friend.best;
        })
        .map(function (friend) {
            return friend.name;
        });
}

function getFriendsObjects(friends, visitedFriends) {
    return visitedFriends
        // Получим по именам объекты друзей
        .map(function (visitedFriend) {
            return getFriend(friends, visitedFriend);
        });
}

function collectFriends(friends, filter, maxLevel) {
    var visitedFriends = [];
    maxLevel = maxLevel > 0 ? maxLevel : 0;
    var currentLevelFriends = getBestFriendsNames(friends);

    while (currentLevelFriends.length > 0 && maxLevel > 0) {
        currentLevelFriends = currentLevelFriends
            // Сортируем текущий уровень по имени
            .sort(sortByName)
            // У каждого человека с этого уровня собираем его друзей
            .reduce(function (nextLevelFriends, friendName, index, arr) {
                var currentFriend = getFriend(friends, friendName);
                visitedFriends.push(friendName);

                var arraysToCheckFriend = [visitedFriends, nextLevelFriends, arr];
                var filteredFriends = currentFriend.friends
                    // Получим друзей, которых не было на предыдущем уровне, нет на этом
                    // и мы не добавили их в следующий уровень
                    .filter(function (friend) {
                        return arraysToCheckFriend
                            .every(function (array) {
                                return array.indexOf(friend) === -1;
                            });
                    });

                return nextLevelFriends.concat(filteredFriends);
            }, []);
        maxLevel--;
    }

    return getFriendsObjects(friends, visitedFriends)
        .filter(filter.filterFunction);
}

function validateFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong filter argument');
    }
}

function getMaxLevel(maxLevel) {
    if (maxLevel === undefined || maxLevel === null) {
        maxLevel = {};
    }

    return maxLevel.value || Infinity;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 */
function Iterator(friends, filter, maxLevel) {
    validateFilter(filter);
    maxLevel = getMaxLevel(maxLevel);
    this.index = 0;
    this.friends = collectFriends(friends, filter, maxLevel);
}

Iterator.prototype.done = function () {
    return this.friends.length === this.index;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.friends[this.index++];
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
    Iterator.call(this, friends, filter, {
        value: maxLevel
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {}

Filter.prototype.filterFunction = function () {
    return true;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;
MaleFilter.prototype.filterFunction = function (friend) {
    return friend.gender === 'male';
};

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;
FemaleFilter.prototype.filterFunction = function (friend) {
    return friend.gender === 'female';
};

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
