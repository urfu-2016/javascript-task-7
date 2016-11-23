'use strict';

/* function findByName(list, name) {
    return list.find(function (element) {
        return element.name === name;
    });
}*/

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

function getWave(friends) {
    var roster = friends.pop();
    var vawe = [];
    var result = [];

    vawe = friends[friends.length - 1].reduce(function (acc, person) {
        return acc.concat(person.friends);
    }, vawe);

    roster = roster.filter(function (person) {
        if (vawe.indexOf(person.name) !== -1) {
            result.push(person);

            return false;
        }

        return true;
    });

    return friends.concat([result, roster]);
}


function sortFriends(friends) {
    var bestFriends = [];

    friends = friends.filter(function (person) {
        if (person.best) {
            bestFriends.push(person);

            return false;
        }

        return true;
    });

    friends = [bestFriends, friends];

    while (friends[friends.length - 1].length) {
        friends = getWave(friends);
    }

    friends.pop();

    return friends;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    var roster = sortFriends(getCopy(friends));

    this.invited = [];
    while (roster.length) {
        this.invited = this.invited.concat(
                roster.pop().filter(filter.filter)
            );
    }

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
    var roster = sortFriends(getCopy(friends));
    roster = roster.splice(0, maxLevel);

    this.invited = [];
    while (roster.length) {
        this.invited = this.invited.concat(
                roster.pop().filter(filter.filter)
            );
    }

    Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    var flag = true;

    return {
        filter: function () {
            return flag;
        }
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    var result = {
        filter: function filter(person) {
            return person.gender === 'male';
        }
    };

    return Object.setPrototypeOf(result, new Filter());
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    var result = {
        filter: function filter(person) {
            return person.gender === 'female';
        }
    };

    return Object.setPrototypeOf(result, new Filter());
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
