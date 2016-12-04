'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    var filteredFriends = new FilteredFriends(friends, filter, arguments[2]);
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this.next = function () {
        return (filteredFriends.current < filteredFriends.last)
        ? filteredFriends.friendsArray[filteredFriends.current++] : null;
    };
    this.done = function () {
        return !(filteredFriends.current < filteredFriends.last);
    };
}

/**
 * Содержит отфильтрованный и отсортированный
 * массив друзей
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей 
 */
function FilteredFriends(friends, filter, maxLevel) {
    this.friendsArray = getSortedByNameAndPriorityFriends(friends, maxLevel)
        .filter(function (friend) {
            return filter.result(friend);
        });
    this.current = 0;
    this.last = this.friendsArray.length;
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
    Iterator.call(this, friends, filter, maxLevel);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Сортирует приглашенных друзей по имени и кругу
 * @param {Object[]} friends
 * @param {Number} maxLevel – максимальный круг друзей
 * @returns {Object[]}
 */
function getSortedByNameAndPriorityFriends(friends, maxLevel) {
    var priorityGroups = setPriority(friends, maxLevel);
    var result = [];
    for (var i = 0; i < priorityGroups.length; i++) {
        priorityGroups[i] = priorityGroups[i].sort(comparer);
        result = result.concat(priorityGroups[i]);
    }

    return result;
}

/**
 * Сортирует приглашенных друзей по имени и кругуddddddddddddddd
 * @param {Object[]} friends - исходный массив друзей
 * @param {Number} maxLevel – максимальный круг друзей
 * @returns {Object[]}
 */
function setPriority(friends, maxLevel) {
    if (maxLevel <= 0) {
        return [];
    }
    var _friends = [];
    copyArrays(friends, _friends);
    var resultArray = [];
    resultArray.push(getFirstLevelFriends(_friends));
    var j = 0;
    if (maxLevel === 1) {
        return resultArray;
    }
    getOtherLevelFriends(_friends, maxLevel, j, resultArray);

    return resultArray;
}


/**
 * Получает список лучщих друзей (1 уровня)
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @returns {Object[]}
 */
function getFirstLevelFriends(friends) {
    var firstLevelFriends = [];
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].best === true) {
            firstLevelFriends.push(friends[i]);
            friends.splice(i, 1);
            i--;
        }
    }

    return firstLevelFriends;
    
}

/**
 * Получает списки остальных друзей
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @param {Number} maxLevel – максимальный круг друзей
 * @param {Number} j - номер текущего уровня минус 2
 * @param {Object[]} resultArray – массив, который содержит массивы друзей одного уровня
 */
function getOtherLevelFriends(friends, maxLevel, j, resultArray) {
    while (friends.length !== 0) {
        var start = friends.length;
        var NlevelFriends = [];
        for (var q = 0; q < resultArray[j].length; q++) {
            getNlevelFriends(resultArray[j][q], friends, NlevelFriends);
        }
        resultArray.push(NlevelFriends);
        j++;
        if (friends.length - start === 0) {
            break;
        }
        if (maxLevel !== 'undefined' && maxLevel === j + 1) {
            break;
        }
    }
}

function getNlevelFriends(person, friends, NlevelFriends) {
    for (var k = 0; k < person.friends.length; k++) {
        getNlevelFriend(friends, person, k, NlevelFriends);
    }
}

function getNlevelFriend(friends, person, k, NlevelFriends) {
    for (var l = 0; l < friends.length; l++) {
        if (friends[l].name === person.friends[k]) {
            NlevelFriends.push(friends[l]);
            friends.splice(l, 1);
            break;
        }
    }
}

function comparer(a, b) {
    return (a.name >= b.name) ? 1 : -1;
}

function copyArrays(oldArray, newArray) {
    for (var i = 0; i < oldArray.length; i++) {
        newArray[i] = oldArray[i];
    }
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.result = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.result = function (friend) {
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
    this.result = function (friend) {
        return friend.gender === 'female';
    };
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
