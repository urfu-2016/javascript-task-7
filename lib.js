'use strict';

function friendsSelect(friends, filter, maxLevel) {
    maxLevel = maxLevel || Infinity;
    var sortFriends = [];
    var noChecked = {};
    var nextLevel = [];
    var currentLevel = friends.reduce(function (levelFriends, friend) {
        if (friend.best) {
            levelFriends.push(friend);
            nextLevel = nextLevel.concat(friend.friends);
        } else {
            noChecked[friend.name] = friend;
        }

        return levelFriends;
    }, []);
    var newCurrentLevel = function (levelFriends, name) {
        if (noChecked[name]) {
            levelFriends.push(noChecked[name]);
            nextLevel = nextLevel.concat(noChecked[name].friends);
            delete noChecked[name];
        }

        return levelFriends;
    };
    while (currentLevel.length > 0 && maxLevel-- > 0) {
        sortFriends = sortFriends.concat(
            currentLevel.sort(function (first, second) {
                return first.name.localeCompare(second.name);
            })
        );
        var newNextLevel = nextLevel;
        nextLevel = [];
        currentLevel = newNextLevel.reduce(newCurrentLevel, []);
    }

    return sortFriends.filter(function (friend) {
        return filter.call(friend);
    });
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('\'filter\' not a Filter()');
    }

    this._friends = friendsSelect(friends, filter);
}

Iterator.prototype.done = function () {
    return this._friends.length === 0;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this._friends.shift();
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
    if (!(filter instanceof Filter)) {
        throw new TypeError('\'filter\' not a Filter()');
    }

    this._friends = friendsSelect(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor4
 */
function Filter() {
    this._rule = function () {
        return true;
    };
}

Filter.prototype.call = function (friends) {
    return this._rule.call(null, friends);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this._rule = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this._rule = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
