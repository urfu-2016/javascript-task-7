'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this.filteredFriends = new FilteredFriends(friends, filter, arguments[2]);
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
}

Iterator.prototype.next = function () {
    return (this.filteredFriends.current < this.filteredFriends.last)
    ? this.filteredFriends.friendsArray[this.filteredFriends.current++] : null;
};

Iterator.prototype.done = function () {
    return !(this.filteredFriends.current < this.filteredFriends.last);
};

/**
 * Содержит отфильтрованный и отсортированный
 * массив друзей
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function FilteredFriends(friends, filter, maxLevel) {
    this.friendsArray = this.getSortedByNameAndPriorityFriends(friends, maxLevel)
        .filter(function (friend) {
            return filter.result(friend);
        });
    this.current = 0;
    this.last = this.friendsArray.length;
}

/**
 * Сортирует приглашенных друзей по имени и по уровням
 * @param {Object[]} friends
 * @param {Number} maxLevel – максимальный круг друзей
 * @returns {Object[]}
 */
FilteredFriends.prototype.getSortedByNameAndPriorityFriends = function (friends, maxLevel) {
    var priorityGroups = this.setPriority(friends, maxLevel);
    var result = [];
    priorityGroups.forEach(function (priorityGroup) {
        priorityGroup = priorityGroup.sort(comparer);
        result = result.concat(priorityGroup);
    });

    return result;
};

/**
 * Получает список друзей отсортированных по уровням
 * @param {Object[]} friends - исходный массив друзей
 * @param {Number} maxLevel – максимальный круг друзей
 * @returns {Object[]} resultArray - список друзей
 */
FilteredFriends.prototype.setPriority = function (friends, maxLevel) {
    if (maxLevel <= 0) {
        return [];
    }
    var _friends = friends.slice();
    var resultArray = [];
    resultArray.push(this.getFirstLevelFriends(_friends));
    var N = 2;
    if (maxLevel === 1) {
        return resultArray;
    }
    this.getOtherLevelFriends(_friends, maxLevel, N, resultArray);

    return resultArray;
};

/**
 * Получает список лучших друзей (1 уровня)
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @returns {Object[]} firstLevelFriends - лучшие друзья
 */
FilteredFriends.prototype.getFirstLevelFriends = function (friends) {
    var firstLevelFriends = [];
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].best === true) {
            firstLevelFriends.push(friends[i]);
            friends.splice(i, 1);
            i--;
        }
    }

    return firstLevelFriends;
};

/**
 * Получает списки остальных друзей
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @param {Number} maxLevel – максимальный круг друзей
 * @param {Number} N - номер текущего уровня
 * @param {Object[]} resultArray – массив, который содержит массивы друзей одного уровня
 */
FilteredFriends.prototype.getOtherLevelFriends = function (friends, maxLevel, N, resultArray) {
    while (friends.length !== 0) {
        var start = friends.length;
        var NlevelFriends = [];
        for (var q = 0; q < resultArray[N - 2].length; q++) {
            var result = this.getNlevelFriends(friends, resultArray[N - 2][q]);
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
};

/**
 * Получает список друзей одного из друга N-1 уровня
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @param {Object} person - друг N-1 уровня
 * @returns {Object[]} nLevelFriends - список друзей одного из друга N-1 уровня
 */
FilteredFriends.prototype.getNlevelFriends = function (friends, person) {
    var nLevelFriends = [];
    for (var k = 0; k < person.friends.length; k++) {
        var result = this.getNlevelFriend(friends, person, k);
        if (result !== undefined) {
            nLevelFriends.push(result);
        }
    }

    return nLevelFriends;
};

/**
 * Получает друга одного из друга N-1 уровня
 * @param {Object[]} friends - массив друзей,
 * которых мы еще не приглашали
 * @param {Object} person - друг N-1 уровня
 * @param {Number} k - номер
 * @returns {Object[]} - друг одного из друга N-1 уровня
 */
FilteredFriends.prototype.getNlevelFriend = function (friends, person, k) {
    for (var l = 0; l < friends.length; l++) {
        if (friends[l].name === person.friends[k]) {
            var result = friends.splice(l, 1);

            return result[0];
        }
    }

    return undefined;
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
    Iterator.call(this, friends, filter, maxLevel);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);

function comparer(a, b) {
    return (a.name >= b.name) ? 1 : -1;
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.gender = '';
}
Filter.prototype.result = function () {
    return true;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.gender = 'male';
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.result = function (friend) {
    return friend.gender === this.gender;
};

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.gender = 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.result = function (friend) {
    return friend.gender === this.gender;
};

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
