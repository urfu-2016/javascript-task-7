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
 * Сортирует приглашенных друзей по имени и по уровням
 * @param {Object[]} friends
 * @param {Number} maxLevel – максимальный круг друзей
 * @returns {Object[]}
 */
function getSortedByNameAndPriorityFriends(friends, maxLevel) {
    var priorityGroups = setPriority(friends, maxLevel);
    var result = [];
	priorityGroups.forEach(function(priorityGroup, i, priorityGroups){
		priorityGroup = priorityGroup.sort(comparer);
        result = result.concat(priorityGroup);
	});

    return result;
}

/**
 * Получает список друзей отсортированных по уровням
 * @param {Object[]} friends - исходный массив друзей
 * @param {Number} maxLevel – максимальный круг друзей
 * @returns {Object[]} resultArray - список друзей
 */
function setPriority(friends, maxLevel) {
    if (maxLevel <= 0) {
        return [];
    }
    var _friends = [];
    copyArrays(friends, _friends);
    var resultArray = [];
    resultArray.push(getFirstLevelFriends(_friends));
    var N = 2;
    if (maxLevel === 1) {
        return resultArray;
    }
    getOtherLevelFriends(_friends, maxLevel, N, resultArray);

    return resultArray;
}


/**
 * Получает список лучщих друзей (1 уровня)
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @returns {Object[]} firstLevelFriends - лучшие друзья
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
 * @param {Number} N - номер текущего уровня
 * @param {Object[]} resultArray – массив, который содержит массивы друзей одного уровня
 */
function getOtherLevelFriends(friends, maxLevel, N, resultArray) {
    while (friends.length !== 0) {
        var start = friends.length;
        var NlevelFriends = [];
        for (var q = 0; q < resultArray[N - 2].length; q++) {
            var result = getNlevelFriends(friends, resultArray[N - 2][q]);
            NlevelFriends = NlevelFriends.concat(result);
        }
        resultArray.push(NlevelFriends);
        N++;
        if (friends.length - start === 0) {
            break;
        }
        if (maxLevel !== undefined && maxLevel === N - 1) {
            break;
        }
    }
}

/**
 * Получает список друзей одного из друга N-1 уровня
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @param {Object} person - друг N-1 уровня
 * @returns {Object[]} nLevelFriends - список друзей одного из друга N-1 уровня
 */
function getNlevelFriends(friends, person) {
    var nLevelFriends = [];
    for (var k = 0; k < person.friends.length; k++) {
        var result = getNlevelFriend(friends, person, k);
        if (result !== undefined) {
            nLevelFriends.push(result);
        }
    }

    return nLevelFriends;
}

/**
 * Получает друга одного из друга N-1 уровня
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @param {Object} person - друг N-1 уровня
 * @param {Number} k - номер
 * @returns {Object[]} - друг одного из друга N-1 уровня
 */
function getNlevelFriend(friends, person, k) {
    for (var l = 0; l < friends.length; l++) {
        if (friends[l].name === person.friends[k]) {
            var result = friends.splice(l, 1);

            return result[0];
        }
    }

    return undefined;
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
