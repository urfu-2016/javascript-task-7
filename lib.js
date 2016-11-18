'use strict';

function alphabetically(a, b) {
    return a.name < b.name ? -1 : Number(a.name > b.name);
}

function byLevelThenByName(a, b) {
    return a.level === b.level ? alphabetically(a, b) : a.level - b.level;
}

function splitToLevels(friends, filter) {
    var visited = {};
    var queue = friends
        .filter(function (friend) {
            return friend.best;
        })
        .map(function (friend) {
            friend.level = 0;
            visited[friend.name] = true;

            return friend;
        });
    var person;
    var filterFunc = function (friend) {
        return person.friends.indexOf(friend.name) !== -1 && !visited[friend.name];
    };
    var loopFunc = function (friend) {
        visited[friend.name] = true;
        friend.level = person.level + 1;
        queue.push(friend);
    };
    while (queue.length) {
        person = queue.shift();

        friends
            .filter(filterFunc)
            .forEach(loopFunc);
    }

    return friends.slice().sort(byLevelThenByName)
        .filter(function (friend) {
            return filter.apply(friend);
        })
        .map(function (friend) {
            delete friend.level;

            return friend;
        })
        .reverse();
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends) {
    var filters = [].slice.call(arguments, 1);
    if (!filters.every(function (filter) {
        return filter instanceof Filter;
    })) {
        throw new TypeError('Each `filter` must be an instance of Filter');
    }
    this.friends = splitToLevels(friends, new CompositeFilter(filters));
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

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.apply = function () {
        return true;
    };
}

function CompositeFilter(filters) {
    this.filters = filters;
}

CompositeFilter.prototype.apply = function (person) {
    return this.filters.every(function (filter) {
        return filter.apply(person);
    });
};

function LevelFilter(maxLevel) {
    this.apply = function (person) {
        return person.level < maxLevel;
    };
}

LevelFilter.prototype = Object.create(Filter.prototype);
LevelFilter.prototype.constructor = LevelFilter;

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.apply = function (person) {
        return person.gender === 'male';
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
    this.apply = function (person) {
        return person.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
