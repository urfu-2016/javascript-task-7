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

    var getFriendByName = createFriendByNameGetter();
    this.friendshipLevels = divideIntoFriendshipLevels().map(function (level) {
        return filter
            .filterFriends(level)
            .sort(function (friend1, friend2) {
                return friend2.name < friend1.name;
            });
    });

    this.levelIndex = 0;
    this.nextIndex = 0;

    /**
     * Делит друзей на круги (уровни) друзей
     * @returns {Array} - уровни друзей, где 0 - лучшие, 1 - друзья лучших и т.д.
     */
    function divideIntoFriendshipLevels() {
        var levels = [];

        /* Начинаем с лучших друзей */
        var queueForAdding = friends.filter(function (friend) {
            return friend.best;
        });

        /* Запоминаем, что уже брали их */
        var viewedFriends = Object.create(null);
        queueForAdding.forEach(function (friend) {
            viewedFriends[friend.name] = true;
        });

        var numberOfFriendsInNextLevel;
        while ((numberOfFriendsInNextLevel = queueForAdding.length)) {
            var lastLevelIndex = levels.push([]) - 1;
            for (var i = 0; i < numberOfFriendsInNextLevel; i++) {
                var currentFriend = queueForAdding.shift();
                levels[lastLevelIndex].push(currentFriend);
                queueForAdding = queueForAdding.concat(
                    getFriendUnviewedFriends(currentFriend, viewedFriends)
                );
            }
        }

        return levels;
    }

    function createFriendByNameGetter() {
        var friendByName = Object.create(null);
        friends.forEach(function (friend) {
            friendByName[friend.name] = friend;
        });

        return function (name) {
            return friendByName[name];
        };
    }

    /**
     * Берёт друзей друга, которые ещё не были просмотрены
     * @param {Object} friend - друг, чьих друзей просматриваем
     * @param {{String: Boolean}} viewedFriendsNames - имена просмотренных друзей
     * @returns {Object[]} друзья, которые не были просмотрены ранее
     */
    function getFriendUnviewedFriends(friend, viewedFriendsNames) {
        return friend.friends.reduce(function (unviewedFriends, friendName) {
            if (!viewedFriendsNames[friendName]) {
                viewedFriendsNames[friendName] = true;
                unviewedFriends.push(getFriendByName(friendName));
            }

            return unviewedFriends;
        }, []);
    }
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
    while (this.levelIndex < this.friendshipLevels.length &&
        this.friendshipLevels[this.levelIndex].length === 0) {
        this.levelIndex++;
    }

    return this.levelIndex >= this.friendshipLevels.length;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.friendshipLevels[this.levelIndex][this.nextIndex++];
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
    this.genderPattern = /[\s\S]*/;
}
Filter.prototype.filterFriends = function (friends) {
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
