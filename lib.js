'use strict';

function getCopy(item) {
    if (item instanceof Array) {
        return item.map(function (element) {
            return getCopy(element);
        });
    }

    var copy = {};

    return Object.keys(item).reduce(function (obj, key) {
        obj[key] = item[key];

        return obj;
    }, copy);
}

function sortFriends(friends) {
    var roster = {
        finished: [],
        list: []
    };

    var bestFriends = [];

    friends = friends.filter(function (person) {
        if (person.best) {
            bestFriends.push(person);

            return false;
        }

        return true;
    });

    roster.finished.push(bestFriends);
    roster.list = friends;

    while (roster.list.length) {
        roster = getWave(roster);
    }

    return roster.finished;
}

function getWave(roster) {
    var vawe = [];
    var result = [];

    vawe = roster.finished[roster.finished.length - 1].reduce(function (acc, person) {
        return acc.concat(person.friends);
    }, vawe);

    roster.list = roster.list.filter(function (person) {
        if (vawe.indexOf(person.name) !== -1) {
            result.push(person);

            return false;
        }

        return true;
    });

    roster.finished.push(result);

    return roster;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong filter');
    }

    var roster = sortFriends(getCopy(friends));
    this.invited = filter.filterFunc(roster);

    Iterator.prototype.done = function done() {
        return this.invited.length === 0;
    };

    Iterator.prototype.next = function next() {
        return this.invited.pop();
    };
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.apply(this, arguments);
    Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);
    LimitedIterator.prototype.constructor = LimitedIterator;

    var roster = sortFriends(getCopy(friends));
    roster = roster.splice(0, maxLevel);

    this.invited = filter.filterFunc(roster);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.condition = function condition() {
        return true;
    };

    Filter.prototype.filterFunc = function filter(roster) {
        var result = [];
        while (roster.length) {
            result = result.concat(
                roster.pop().filter(this.condition)
            );
        }

        return result;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Filter.apply(this, arguments);
    Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
    MaleFilter.prototype.constructor = MaleFilter;

    this.condition = function (person) {
        return person.gender === 'male';
    };
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Filter.apply(this, arguments);
    Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);
    FemaleFilter.prototype.constructor = FemaleFilter;
    this.condition = function (person) {
        return person.gender === 'female';
    };
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
