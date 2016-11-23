'use strict';

function compareNames(a, b) {
    return a.name > b.name ? 1 : -1;
}

function convertArrayToObject(friends) {
    var objectForFriends = {};
    friends.forEach(function (person) {
        objectForFriends[person.name] = person;
    });

    return objectForFriends;
}

function fillingLevels(invited, nextLevel, maxLevel, objectForFriends) {
    var currentLevel = nextLevel;
    nextLevel = [];
    var fillingLevel = function (person) {
        invited.push(person);
        person.friends.forEach(function (friend) {
            if (!(nextLevel.indexOf(objectForFriends[friend]) !== -1 ||
                currentLevel.indexOf(objectForFriends[friend]) !== -1 ||
                invited.indexOf(objectForFriends[friend]) !== -1)) {
                nextLevel.push(objectForFriends[friend]);
            }
        });
    };
    while (currentLevel.length !== 0 && maxLevel !== 0) {
        currentLevel.sort(compareNames);
        currentLevel.forEach(fillingLevel);
        currentLevel = nextLevel;
        nextLevel = [];
        maxLevel--;
    }

    return invited;
}

function distributeByLevels(friends, filter, maxLevel) {
    if (!maxLevel || maxLevel < 1) {
        return [];
    }
    var invited = [];
    var nextLevel = [];
    var objectForFriends = convertArrayToObject(friends);
    friends.forEach(function (person) {
        if (person.best) {
            invited.push(person);
            person.friends.forEach(function (friend) {
                if (!(nextLevel.indexOf(objectForFriends[friend]) !== -1 ||
                    invited.indexOf(objectForFriends[friend]) !== -1)) {
                    nextLevel.push(objectForFriends[friend]);
                }
            });
        }
    });
    maxLevel--;
    invited = fillingLevels(invited, nextLevel, maxLevel, objectForFriends);

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
        throw new TypeError('filter не является объектом конструктора Filter');
    }
    this.friends = distributeByLevels(friends.sort(compareNames), filter, Infinity)
    .filter(function (person) {
        return filter.getPeopleSameGender(person);
    });
    this.indexEnumeration = -1;
}

Iterator.prototype.done = function () {
    return this.indexEnumeration === this.friends.length - 1;
};
Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    this.indexEnumeration++;

    return this.friends[this.indexEnumeration];
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
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter не является объектом конструктора Filter');
    }
    this.friends = distributeByLevels(friends.sort(compareNames), filter, maxLevel)
    .filter(function (person) {
        return filter.getPeopleSameGender(person);
    });
    this.indexEnumeration = -1;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.gender = 'nothing';
}

Filter.prototype.getPeopleSameGender = function (person) {
    return person.gender === this.gender;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.gender = 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);


/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.gender = 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
