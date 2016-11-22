'use strict';

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

    this._friends = this._sortFriends(friends)
        .filter(function (friend) {
            return filter.call(friend.person);
        })
        .sort(function (first, second) {
            return first.person.name.localeCompare(second.person.name) &&
                first.level >= second.level;
        });
}

Iterator.prototype._sortFriends = function (persons) {
    var friendsFriends = [];
    var friends = persons.reduce(function (newFriends, person) {
        newFriends[person.name] = { person: person };
        if (person.best) {
            friendsFriends = friendsFriends.concat(person.friends);
            newFriends[person.name].level = 1;
        } else {
            newFriends[person.name].level = 0;
        }

        return newFriends;
    }, {});
    var levelCount = 2;
    var addRangRule = function (nextFriends, name) {
        if (!friends[name].level) {
            friends[name].level = levelCount;

            return nextFriends.concat(friends[name].person.friends);
        }

        return nextFriends;
    };
    while (friendsFriends.length !== 0) {
        friendsFriends = friendsFriends.reduce(addRangRule, []);
        levelCount++;
    }

    return Object.keys(friends).reduce(function (arr, item) {
        arr.push(friends[item]);

        return arr;
    }, []);
};

Iterator.prototype.done = function () {
    return this._friends.length === 0;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this._friends.shift().person;
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

    this._friends = this._friends.filter(function (friend) {
        return friend.level <= maxLevel;
    });
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
