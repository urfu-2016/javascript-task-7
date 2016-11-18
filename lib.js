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

        friends.filter(filterFunc).forEach(loopFunc);
    }

    return friends.slice().sort(byLevelThenByName)
        .filter(filter)
        .map(function (friend) {
            delete friend.level;

            return friend;
        })
        .reverse();
}

function checkFilter(filter) {
    return filter instanceof Filter;
}

function checkFilters(filters) {
    if (!filters.every(checkFilter)) {
        throw new TypeError('Each `filter` must be an instance of Filter');
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends) {
    var filters = [].slice.call(arguments, 1);
    checkFilters(filters);
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
    function apply() {
        return true;
    }
    Object.setPrototypeOf(apply, Filter.prototype);

    return apply;
}

Filter.prototype = Object.create(Function.prototype);
Filter.prototype.constructor = Filter;

function CompositeFilter(filters) {
    function apply(person) {
        return filters.every(function (filter) {
            return filter(person);
        });
    }
    Object.setPrototypeOf(apply, CompositeFilter.prototype);

    return apply;
}

CompositeFilter.prototype = Object.create(Filter.prototype);
CompositeFilter.prototype.constructor = CompositeFilter;

function LevelFilter(maxLevel) {
    function apply(person) {
        return person.level < maxLevel;
    }
    Object.setPrototypeOf(apply, LevelFilter.prototype);

    return apply;
}

LevelFilter.prototype = Object.create(Filter.prototype);
LevelFilter.prototype.constructor = LevelFilter;

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    function apply(person) {
        return person.gender === 'male';
    }
    Object.setPrototypeOf(apply, MaleFilter.prototype);

    return apply;
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    function apply(person) {
        return person.gender === 'female';
    }
    Object.setPrototypeOf(apply, FemaleFilter.prototype);

    return apply;
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
