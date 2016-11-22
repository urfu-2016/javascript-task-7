'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!Filter.prototype.isPrototypeOf(filter)) {
        throw new TypeError('Фильтр не является инстансом объекта Filter');
    }

    this.friendshipLevels = divideIntoFriendshipLevels(friends).map(function (level) {
        return filter.filter(level)
            .sort(function (friend1, friend2) {
                return friend2.name < friend1.name;
            });
    });

    this.levelIndex = 0;
    this.nextIndex = 0;
}

Iterator.prototype.done = function () {
    if (this.levelIndex >= this.friendshipLevels.length) {
        return true;
    }

    if (this.nextIndex < this.friendshipLevels[this.levelIndex].length) {
        return false;
    }

    this.nextIndex = 0;
    this.levelIndex++;
    while (
        this.levelIndex < this.friendshipLevels.length &&
        this.friendshipLevels[this.levelIndex].length === 0
    ) {
        this.levelIndex++;
    }

    return this.levelIndex >= this.friendshipLevels.length;
};

Iterator.prototype.next = function () {
    return !this.done() ? this.friendshipLevels[this.levelIndex][this.nextIndex++] : null;
};

/**
 * Делит друзей на круги (уровни) друзей
 * @param {Object[]} friends
 * @returns {Array} - уровни друзей, где 0 - лучшие, 1 - друзья лучших и т.д.
 */
function divideIntoFriendshipLevels(friends) {
    var levels = [];

    /* Начинаем с лучших друзей */
    var queueForAdding = friends.filter(function (friend) {
        return friend.best;
    });

    /* Запоминаем, что уже брали их */
    var viewedFriends = queueForAdding.reduce(function (viewed, friend) {
        viewed[friend.name] = true;

        return viewed;
    }, Object.create(null));

    var numberOfFriendsInNextLevel;
    while ((numberOfFriendsInNextLevel = queueForAdding.length)) {
        levels.push([]);
        for (var i = 0; i < numberOfFriendsInNextLevel; i++) {
            var currentFriend = queueForAdding.shift();
            levels[levels.length - 1].push(currentFriend);
            queueForAdding = queueForAdding.concat(
                getFriendUnviewedFriends(currentFriend, viewedFriends, friends)
            );
        }
    }

    return levels;
}

/**
 * Берёт друзей друга, которые ещё не были просмотрены
 * @param {Object} friend - друг, чьих друзей просматриваем
 * @param {{String: Boolean}} viewedFriendsNames - имена просмотренных друзей
 * @param {Object[]} friends
 * @returns {Object[]} друзья, которые не были просмотрены ранее
 */
function getFriendUnviewedFriends(friend, viewedFriendsNames, friends) {
    return friend.friends.reduce(function (unviewedFriends, friendName) {
        if (!viewedFriendsNames[friendName]) {
            viewedFriendsNames[friendName] = true;
            unviewedFriends.push(findFriendWithName(friends, friendName));
        }

        return unviewedFriends;
    }, []);
}

/**
 * Поиск объекта friend по имени
 * @param {Object[]} friends
 * @param {String} name
 * @returns {Object}
 */
function findFriendWithName(friends, name) {
    var result = null;
    friends.some(function (friend) {
        return friend.name === name ? ((result = friend), true) : false;
    });

    return result;
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
    if (this.friendshipLevels.length > maxLevel) {
        this.friendshipLevels.length = maxLevel >= 0 ? maxLevel : 0;
    }
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.genderPattern = /.*/;
}
Filter.prototype.filter = function (friends) {
    return friends.filter(function (friend) {
        return this.genderPattern.test(friend.gender);
    }, this);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.genderPattern = /^male$/;
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.genderPattern = /^female$/;
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
