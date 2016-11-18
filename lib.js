'use strict';

function alphabetically(a, b) {
    return a.name < b.name ? -1 : Number(a.name > b.name);
}

function byLevelThenByName(a, b) {
    return (a.level - b.level) * 10 + alphabetically(a, b);
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
    function isAppropriate(friend) {
        return person.friends.indexOf(friend.name) !== -1 && !visited[friend.name];
    }
    while (queue.length) {
        person = queue.shift();

        var personFriends = friends.filter(isAppropriate);
        for (var i = 0; i < personFriends.length; i++) {
            var personFriend = personFriends[i];
            visited[personFriend.name] = true;
            personFriend.level = person.level + 1;
            queue.push(personFriend);
        }
    }

    return friends.slice().sort(byLevelThenByName)
        .filter(filter.apply.bind(filter))
        .map(function (friend) {
            delete friend.level;

            return friend;
        })
        .reverse();
}

function checkIsFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('`filter` must be an instance of Filter');
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
    filters.forEach(checkIsFilter);
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
