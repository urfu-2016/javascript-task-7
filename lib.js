'use strict';

/* eslint no-empty-function: ["error", { "allow": ["functions"] }]*/

function sortByName(firstPerson, secondPerson) {
    if (firstPerson.name === secondPerson.name) {
        return 0;
    }

    return firstPerson.name > secondPerson.name ? 1 : -1;
}

function getBestFriends(friends) {
    return friends
        .filter(function (friend) {
            return friend.best;
        });
}

function getFriendsDict(friends) {
    return friends.reduce(function (friendsDict, friend) {
        friendsDict[friend.name] = friend;

        return friendsDict;
    }, {});
}

function collectFriends(friends, filter, maxLevel) {
    var visitedFriends = [];
    maxLevel = maxLevel > 0 ? maxLevel : 0;
    var currentLevelFriends = getBestFriends(friends);

    // Получим словарь исходных друзей для получения доступа к ним за O(1)
    var friendsDict = getFriendsDict(friends);

    while (currentLevelFriends.length > 0 && maxLevel > 0) {
        currentLevelFriends = currentLevelFriends
            // Сортируем текущий уровень по имени
            .sort(sortByName)
            // У каждого человека с этого уровня собираем его друзей
            .reduce(function (nextLevelFriends, currentLevelFriend, index, arr) {
                visitedFriends.push(currentLevelFriend);

                var arraysToCheckFriend = [visitedFriends, nextLevelFriends, arr];
                var notVisitedFriends = getNotVisitedFriends(
                    friendsDict,
                    currentLevelFriend,
                    arraysToCheckFriend
                );

                return nextLevelFriends.concat(notVisitedFriends);
            }, []);
        maxLevel--;
    }

    return visitedFriends.filter(filter.filterFunction);
}

function getNotVisitedFriends(friendsDict, currentLevelFriend, arraysToCheckFriend) {
    return currentLevelFriend.friends
        .map(function (friendOfFriendName) {
            return friendsDict[friendOfFriendName];
        })
        // Получим друзей, которых не было на предыдущем уровне, нет на этом
        // и мы не добавили их в следующий уровень
        .filter(function (friendOfCurrentFriend) {
            return arraysToCheckFriend
                .every(function (array) {
                    return array.indexOf(friendOfCurrentFriend) === -1;
                });
        });
}

function validateFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong filter argument');
    }
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
    maxLevel = maxLevel === undefined ? Infinity : maxLevel.value;
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
