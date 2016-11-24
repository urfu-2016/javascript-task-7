'use strict';

function byLevelThenByNameDescending(a, b) {
    return b.level - a.level || (b.name < a.name ? -1 : (b.name > a.name ? 1 : 0)) // eslint-disable-line
}

function setPrototype(fn, proto) {
    fn.prototype = Object.create(proto);
    fn.prototype.constructor = fn;
}

function getAppropriateFriends(friends, filter) {
    var visited = friends.reduce(function (result, friend) {
        result[friend.name] = friend.best;

        return result;
    }, {});
    var queue = friends.filter(function (friend) {
        return friend.best;
    });
    queue.forEach(function (friend) {
        friend.level = 0;
    });

    function isFriendAndNotVisited(friend) {
        return this.friends.indexOf(friend.name) !== -1 && // eslint-disable-line no-invalid-this
            !visited[friend.name];
    }
    for (var person = queue.shift(); person; person = queue.shift()) {
        var personFriends = friends.filter(isFriendAndNotVisited, person);
        for (var i = 0; i < personFriends.length; i++) {
            var personFriend = personFriends[i];
            visited[personFriend.name] = true;
            personFriend.level = person.level + 1;
            queue.push(personFriend);
        }
    }

    return friends
        .filter(filter.match, filter)
        .sort(byLevelThenByNameDescending)
        .map(function (friend) {
            delete friend.level;

            return friend;
        });
}

function checkIsFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('`filter` must be an instance of Filter, but was' +
            filter.constructor.name);
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {...Filter} filters
 */
function Iterator(friends) {
    var filters = [].slice.call(arguments, 1);
    filters.forEach(checkIsFilter);
    filters.push(new LevelFilter(Infinity));
    this.friends = getAppropriateFriends(friends, new CompositeFilter(filters));
}

Iterator.prototype.next = function () {
    return this.friends.pop() || null;
};

Iterator.prototype.done = function () {
    return !this.friends.length;
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
    Iterator.call(this, friends, filter, new LevelFilter(maxLevel));
}
setPrototype(LimitedIterator, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() { // eslint-disable-line no-empty-function
}

Filter.prototype.match = function () {
    return true;
};

function CompositeFilter(filters) {
    this.filters = filters;
}

CompositeFilter.prototype.match = function (person) {
    return this.filters.every(function (filter) {
        return filter.match(person);
    });
};

function LevelFilter(maxLevel) {
    this.maxLevel = maxLevel > 0 ? maxLevel : Infinity;
}
setPrototype(LevelFilter, Filter.prototype);

LevelFilter.prototype.match = function (person) {
    return person.hasOwnProperty('level') && person.level < this.maxLevel;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() { // eslint-disable-line no-empty-function
}
setPrototype(MaleFilter, Filter.prototype);

MaleFilter.prototype.match = function (person) {
    return person.gender === 'male';
};

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() { // eslint-disable-line no-empty-function
}
setPrototype(FemaleFilter, Filter.prototype);

FemaleFilter.prototype.match = function (person) {
    return person.gender === 'female';
};

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
