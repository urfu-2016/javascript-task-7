'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    var p = new P(friends, filter, arguments[2]);
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this.next = function () {
        return (p.current < p.last) ? p.filteredFriends[p.current++] : null;
    };
    this.done = function () {
        return !(p.current < p.last);
    };
}

function P(friends, filter, maxLevel) {
    this.filteredFriends = applyFilter(
        getSortedByNameAndPriorityFriends(friends, maxLevel), filter);
    this.current = 0;
    this.last = this.filteredFriends.length;
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

function getSortedByNameAndPriorityFriends(friends, maxLevel) {
    var priorityGroups = setPriority(friends, maxLevel);
    var result = [];
    for (var i = 0; i < priorityGroups.length; i++) {
        priorityGroups[i] = priorityGroups[i].sort(comparer);
        result = result.concat(priorityGroups[i]);
    }

    return result;
}

function setPriority(friends, n) {
    if (n === 0) {
        return [];
    }
    var _friends = [];
    copyArrays(friends, _friends);
    var resultArray = [];
    getFirstLevelFriends(resultArray, _friends);
    var j = 0;
    if (n === 1) {
        return resultArray;
    }
    getFriendsLevels(_friends, n, j, resultArray);

    return resultArray;
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

function getFriendsLevels(_friends, n, j, resultArray) {
    while (_friends.length !== 0) {
        var start = _friends.length;
        var NlevelFriends = [];
        for (var q = 0; q < resultArray[j].length; q++) {
            getNlevelFriends(resultArray[j][q], _friends, NlevelFriends);
        }
        resultArray.push(NlevelFriends);
        j++;
        if (_friends.length - start === 0) {
            break;
        }
        if (n !== 'undefined' && n === j + 1) {
            break;
        }
    }
}

function getNlevelFriends(person, _friends, NlevelFriends) {
    for (var k = 0; k < person.friends.length; k++) {
        getNlevelFriend(_friends, person, k, NlevelFriends);
    }
}

function getNlevelFriend(_friends, person, k, NlevelFriends) {
    for (var l = 0; l < _friends.length; l++) {
        if (_friends[l].name === person.friends[k]
		&& _friends[l].friends.indexOf(person.name) !== -1) {
            NlevelFriends.push(_friends[l]);
            _friends.splice(l, 1);
            break;
        }
    }
}

function isMutualFriendship() {
    
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
    this.type = 'none';
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
    this.type = 'male';
}
MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.type = 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
