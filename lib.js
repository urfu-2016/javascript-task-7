'use strict';

/**
 * Ищем объект с именем name в исходном массиве,
 * если нашли то возвращаем его
 * @param {Object[]} friends
 * @param {String} name
 * @returns {Object|undefined}
 */
function getObjectFriend(friends, name) {

    function isHasFriend(element) {
        return element.name === name;
    }

    return friends.find(isHasFriend);
}

/**
 * Проверяем, что друг не undefined
 * @param {Object} friend
 * @returns {Boolean}
 */
function isNotUndefined(friend) {
    return friend !== undefined;
}

/**
 * Берем друзей списка currentLevel,
 * так, чтобы повторяющихся не было в одном списке
 * @param {Object[]} currentLevel
 * @returns {Object[]}
 */
function getLevel(currentLevel) {
    return currentLevel.reduce(function (level, currentFriend) {
        return level.concat(currentFriend.friends.filter(function (name) {
            return level.indexOf(name) === -1;
        }));
    }, []);
}

/**
 * Проверяем является ли данный друг лучшим
 * @param {Object} friend
 * @returns {Boolean}
 */
function isBestFriend(friend) {
    return friend.best === true;
}

/**
 * Сравниваем имена двух друзей по алфавитному порядку
 * @param {String} friend1
 * @param {String} friend2
 * @returns {Boolean}
 */
function compareFriends(friend1, friend2) {
    return friend1.name.localeCompare(friend2.name);
}

/**
 * Составляем весь список друзей
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 * @returns {Object[]}
 */
function getInvitedFriends(friends, filter, maxLevel) {
    var currentLevel = maxLevel;
    if (maxLevel === undefined) {
        currentLevel = Infinity;
    }
    var invitedFriends = [];
    var currentFriends = friends.filter(isBestFriend).sort(compareFriends);
    var isUsed = function (friend) {
        return invitedFriends.indexOf(friend) === -1;
    };

    while (currentFriends.length && currentLevel > 0) {
        currentLevel--;
        invitedFriends = invitedFriends.concat(currentFriends);
        var nextLevel = getLevel(currentFriends).map(function (name) {
            return getObjectFriend(friends, name);
        });
        currentFriends = nextLevel.filter(isNotUndefined).filter(isUsed)
                                .sort(compareFriends);
    }

    return invitedFriends.filter(filter.isChoose);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    console.info(friends, filter);
    if (!(filter instanceof Filter)) {
        throw new TypeError('Object does not belong to Filter');
    }
    this.invitedFriends = getInvitedFriends(friends, filter);
    this.pointer = 0;
}

Iterator.prototype.done = function () {
    return this.invitedFriends.length === this.pointer;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.invitedFriends[this.pointer++];
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
    console.info(friends, filter, maxLevel);
    if (!(filter instanceof Filter)) {
        throw new TypeError('Object does not belong to Filter');
    }

    this.invitedFriends = getInvitedFriends(friends, filter, maxLevel);
    this.pointer = 0;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    console.info('Filter');
    this.isChoose = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    console.info('MaleFilter');
    this.isChoose = function (friend) {
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
    console.info('FemaleFilter');
    this.isChoose = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
