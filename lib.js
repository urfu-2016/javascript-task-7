'use strict';


function findByName(list, name) {
    return list.find(function (element) {
        return element.name === name;
    });
}

function getFriendsWave(invited, roster) {
    var result = [];

    result = invited
    .reduce(function (acc, person) {
        return acc.concat(person.friends);
    }, result)
    .sort()
    .map(function (item) {
        return findByName(roster, item);
    })
    .filter(function (item) {
        return invited.indexOf(item) === -1;
    });

    return result;
}

function sortFriends(roster, maxLevel) {
    var bestFriends = roster.filter(function (item) {
        return item.best && item.best === true;
    });

    var invited = [].concat(bestFriends);
    var wave = bestFriends;

    while (wave.length !== 0 && (!maxLevel || --maxLevel !== 0)) {
        wave = getFriendsWave(invited, roster);
        invited = invited.concat(wave);
    }

    return invited;
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

    this.invited = filter.filterFunc(sortFriends(friends));

    Iterator.prototype.done = function done() {
        return this.invited.length === 0;
    };

    Iterator.prototype.next = function next() {
        return this.invited.shift();
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

    this.invited = filter.filterFunc(sortFriends(friends, maxLevel));
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
        return roster.filter(this.condition);
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
