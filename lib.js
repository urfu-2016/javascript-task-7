'use strict';

var addedFriends = [];
var addedNameFriends = [];
var addedMale = [];
var addedFemale = [];

/*
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this.filter = filter;
    this.index = 0;
    if (!(filter instanceof Filter)) {
        throw new TypeError('Неверный тип фильтра');
    }
    addBestFriends(friends);
    roundFriend(friends, filter, Number.POSITIVE_INFINITY);
}
Iterator.prototype.done = function () {
    return filtedFriend(this.filter).length <= this.index;
};
Iterator.prototype.next = function () {
    var nextFriend = filtedFriend(this.filter)[this.index];
    this.index++;

    return nextFriend;
};

/*
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Неверный тип фильтра');
    }
    this.filter = filter;
    this.index = 0;
    if (typeof maxLevel === undefined || maxLevel < 1) {
        addedFriends = filter.filterFunction(friends);
    } else {
        addBestFriends(friends);
        roundFriend(friends, filter, maxLevel);
    }
}
LimitedIterator.prototype = Object.create(Iterator.prototype);

function getNameFrends() {
    return addedFriends.map(function (addedFriend) {
        return addedFriend.name;
    });
}

function addBestFriends(friends) {
    addedFriends = friends.filter(function (friend) {
        return 'best' in friend;
    }).sort();
    addedNameFriends = getNameFrends(addedFriends);
}

function roundFriend(friends, filter, maxLevel) {
    var indCurentFriend = 0;
    var countRound = 1;
    var nameCurrentFriends = [];
    var findedFriends = [];
    while (countRound !== maxLevel && indCurentFriend < addedFriends.length) {
        while (indCurentFriend !== addedFriends.length) {
            nameCurrentFriends = addedFriends[indCurentFriend].friends;
            nameCurrentFriends.forEach(function (nameCurrentFriend) {
                friends.forEach(function (friend) {
                    if (friend.name === nameCurrentFriend) {
                        findedFriends.push(friend);
                    }
                });
            });
            indCurentFriend++;
        }
        addFindedFriends(sortCollection(findedFriends));
        countRound++;
    }
    addedFriends = filter.filterFunction(addedFriends);
    addedNameFriends = getNameFrends(addedFriends);
    addFilteredFriends(filter);
}

function sortCollection(collection) {
    return collection.sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
    });
}

function filtedFriend(filter) {
    if (filter.propertyFilter === 'male') {
        return addedMale;
    }
    if (filter.propertyFilter === 'female') {
        return addedFemale;
    }
}

function addFilteredFriends(filter) {
    if (filter.propertyFilter === 'male') {
        addedMale = filter.filterFunction(addedFriends);
    } else {
        addedFemale = filter.filterFunction(addedFriends);
    }
}

function addFindedFriends(findedFriends) {
    findedFriends.forEach(function (findedFriend) {
        if (isNotInvitedFriend(findedFriend)) {
            addedFriends.push(findedFriend);
            addedNameFriends.push(findedFriend.name);
        }
    });
}

function isNotInvitedFriend(friend) {
    return addedNameFriends.indexOf(friend.name) === -1;
}

/*
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.propertyFilter = '';
}
Filter.prototype.filterFunction = function (friends) {
    return filterOnProperty(this.propertyFilter, friends);
};

function filterOnProperty(propertyFilter, friends) {
    return friends.filter(function (friend) {
        return friend.gender === propertyFilter || propertyFilter === '';
    });
}

/*
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.propertyFilter = 'male';
}
MaleFilter.prototype = Object.create(Filter.prototype);

/*
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.propertyFilter = 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
