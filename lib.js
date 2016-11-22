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

    this._maxLevel = arguments[2] || Infinity;

    this._friends = this._sortFriends(friends)
        .filter(function (friend) {
            return filter.call(friend);
        });
}

Iterator.prototype._sortFriends = function (persons) {
    var friendsFriends = [];
    var friends = persons.reduce(function (newFriends, person) {
        if (person.best) {
            newFriends[1][person.name] = person;
            friendsFriends = friendsFriends.concat(person.friends);
        } else {
            newFriends[0][person.name] = person;
        }

        return newFriends;
    }, [{}, {}]);
    var addLevel = function (nextFriends, name) {
        var lastIndex = friends.length - 1;
        if (friends[0][name]) {
            friends[lastIndex][name] = friends[0][name];
            delete friends[0][name];

            return nextFriends.concat(friends[lastIndex][name].friends);
        }

        return nextFriends;
    };
    while (friendsFriends.length !== 0) {
        friends.push({});
        friendsFriends = friendsFriends.reduce(addLevel, []);
    }
    friends.push(friends.shift());
    friends = friends.slice(0, this._maxLevel);

    return friends.reduce(function (newFriends, rangFriends) {
        var sortName = Object.keys(rangFriends).sort(function (first, second) {
            return first.localeCompare(second);
        });
        sortName.reduce(function (res, name) {
            res.push(rangFriends[name]);

            return res;
        }, newFriends);

        return newFriends;
    }, []);
};

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
    Iterator.call(this, friends, filter, maxLevel);
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
