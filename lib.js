'use strict';

function friendsSelect(friends, filter, maxLevel) {
    maxLevel = maxLevel || Infinity;
    var sortFriends = [];
    var noChecked = {};
    var level = friends.reduce(function (levelFrinds, friend) {
        if (friend.best) {
            levelFrinds.current.push(friend);
            levelFrinds.next = levelFrinds.next.concat(friend.friends);
        } else {
            noChecked[friend.name] = friend;
        }

        return levelFrinds;
    }, { current: [], next: [] });
    while (level.current.length > 0 && maxLevel > 0) {
        sortFriends = sortFriends.concat(
            level.current.sort(function (first, second) {
                return first.name.localeCompare(second.name);
            })
        );

        level = level.next.reduce(function (levelFriends, name) {
            if (noChecked[name]) {
                levelFriends.current.push(noChecked[name]);
                levelFriends.next = levelFriends.next.concat(noChecked[name].friends);
                delete noChecked[name];
            }

            return levelFriends;
        }, { current: [], next: [] });

        maxLevel--;
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
