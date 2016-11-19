'use strict';

function byLevelThenByNameDescending(a, b) {
    return (b.level - a.level) * 10 + (b.name < a.name ? -1 : Number(b.name > a.name));
}

function changePrototype(clazz, proto) {
    clazz.prototype = Object.create(proto);
    clazz.prototype.constructor = clazz;
}

function defineProperty(object, propertyName, value) {
    object[propertyName] = value;

    return object;
}

function getAppropriateFriends(friends, filter) {
    var visited = friends.reduce(function (result, friend) {
        return defineProperty(result, friend.name, friend.best);
    }, {});
    var queue = friends.filter(function (friend) {
        return friend.best && defineProperty(friend, 'level', 0);
    });

    function isAppropriate(friend) {
        return this.friends.indexOf(friend.name) !== -1 && // eslint-disable-line no-invalid-this
            !visited[friend.name];
    }
    for (var person = queue.shift(); person; person = queue.shift()) {
        var personFriends = friends.filter(isAppropriate, person);
        for (var i = 0; i < personFriends.length; i++) {
            var personFriend = personFriends[i];
            visited[personFriend.name] = true;
            personFriend.level = person.level + 1;
            queue.push(personFriend);
        }
    }

    return friends
        .filter(function (friend) {
            return friend.hasOwnProperty('level');
        })
        .sort(byLevelThenByNameDescending)
        .filter(filter.apply, filter)
        .map(function (friend) {
            return delete friend.level && friend;
        });
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
changePrototype(LimitedIterator, Iterator.prototype);

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
        return person.hasOwnProperty('level') && person.level < maxLevel;
    };
}
changePrototype(LevelFilter, Filter.prototype);

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
changePrototype(MaleFilter, Filter.prototype);

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
changePrototype(FemaleFilter, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
