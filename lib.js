'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    var result = getSortedByNameAndPriorityFriends(friends);
    var filteredFriends = applyFilter(result, filter);
    var current = 0;
    var last = filteredFriends.length;

    return {
        next: function () {
            return (current < last) ? filteredFriends[current++] : null;
        },
        done: function () {
            return !(current < last);
        }
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
    var result = getSortedByNameAndPriorityFriends(friends, maxLevel);
    var filteredFriends = applyFilter(result, filter);
    var current = 0;
    var last = filteredFriends.length;

    return {
        next: function () {
            return (current < last) ? filteredFriends[current++] : null;
        },
        done: function () {
            return !(current < last);
        }
    };
}
LimitedIterator.prototype = Object.create(Iterator.prototype);

function getSortedByNameAndPriorityFriends(friends, maxLevel) {
    var priorityGroups = setPriority(friends, maxLevel);
    var result = [];
    for (var i = 0; i < priorityGroups.length; i++) {
        priorityGroups[i] = priorityGroups[i].sort(comparer);
        result = result.concat(priorityGroups[i]);
    }

    return result;
}

function getNlevelFriends(frend, _frends, NlevelFriends) {
    for (var k = 0; k < frend.friends.length; k++) {
        getNlevelFriend(_frends, frend, k, NlevelFriends);
    }
}

function getNlevelFriend(_frends, frend, k, NlevelFriends) {
    for (var l = 0; l < _frends.length; l++) {
        if (_frends[l].name === frend.friends[k]) {
            NlevelFriends.push(_frends[l]);
            _frends.splice(l, 1);
            break;
        }
    }
}

function comparer(a, b) {
    return (a.name >= b.name) ? 1 : -1;
}

function getFirstLevelFriends(resultArray, _friends) {
    var firstLevelFriends = [];
    for (var i = 0; i < _friends.length; i++) {
        if (_friends[i].best === true) {
            firstLevelFriends.push(_friends[i]);
            _friends.splice(i, 1);
            i--;
        }
    }
    resultArray.push(firstLevelFriends);
}

function setPriority(friends, n) {
    var _friends = [];
    copyArrays(friends, _friends);
    var resultArray = [];
    getFirstLevelFriends(resultArray, _friends);
    var j = 0;
    while (_friends.length !== 0) {
        var NlevelFriends = [];
        for (var q = 0; q < resultArray[j].length; q++) {
            getNlevelFriends(resultArray[j][q], _friends, NlevelFriends);
        }
        resultArray.push(NlevelFriends);
        j++;
        if (n !== undefined && n <= j + 1) {
            break;
        }
    }

    return resultArray;
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

    return {
        type: 'none'
    };
}

function applyFilter(friends, filter) {
    var filteredFriends = [];
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].gender === filter.type) {
            filteredFriends.push(friends[i]);
        }
    }

    return filteredFriends;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {

    return {
        type: 'male'
    };
}
MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {

    return {
        type: 'female'
    };
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
