'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filterObject not Instance of Filter');
    }
    this.allFriends = friends;
    this.filterObject = filter;
    this.sortedCircleOfFriends = friends.filter(function (person) {
        return person.best;
    }).sort(this.compareFriends);
    this.viewedFriends = this.sortedCircleOfFriends.map(function (person) {
        return person.name;
    });
    this.processCircleOfFriends();
}

Iterator.prototype.compareFriends = function (person1, person2) {
    return person1.name.localeCompare(person2.name);
};

Iterator.prototype.processCircleOfFriends = function () {
    this.isNotEmptyLevel = this.sortedCircleOfFriends.length > 0;
    this.filteredFriends = this.sortedCircleOfFriends.filter(this.filterObject.customFilter());
    this.currentPersonIndex = 0;
    this.maxPersonIndex = this.filteredFriends.length;
};

Iterator.prototype.fromNameToFriendObj = function (names) {
    return this.allFriends.filter(function (friend) {
        return names.indexOf(friend.name) !== -1;
    });
};

Iterator.prototype.createNextFriendsCircle = function () {
    var thisIterator = this;
    var nextCircleNames = this.sortedCircleOfFriends.reduce(function (nextFriends, person) {
        person.friends.forEach(function (friendName) {
            if (nextFriends.indexOf(friendName) === -1 &&
                thisIterator.viewedFriends.indexOf(friendName) === -1) {
                nextFriends.push(friendName);
                thisIterator.viewedFriends.push(friendName);
            }
        });

        return nextFriends;
    }, []);
    this.sortedCircleOfFriends = this.fromNameToFriendObj(nextCircleNames)
                                     .sort(this.compareFriends);
    this.processCircleOfFriends();
};

Iterator.prototype.done = function () {
    if (!this.isNotEmptyLevel) {
        return true;
    }
    var isAllPersonLooked = this.currentPersonIndex >= this.maxPersonIndex;
    while (isAllPersonLooked && this.isNotEmptyLevel) {
        this.createNextFriendsCircle();
        isAllPersonLooked = this.currentPersonIndex >= this.maxPersonIndex;
    }

    return !this.isNotEmptyLevel;
};

Iterator.prototype.next = function () {
    var nextFriend = this.done() ? null : this.filteredFriends[this.currentPersonIndex];
    this.currentPersonIndex++;

    return nextFriend;
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
    this.maxLevel = maxLevel;
    this.currentLevel = 0;
    Iterator.apply(this, arguments);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

LimitedIterator.prototype.done = function () {
    if (!this.isNotEmptyLevel || this.currentLevel >= this.maxLevel) {
        return true;
    }
    var isLevelInLimit = this.currentLevel < this.maxLevel;
    var isAllPersonLooked = this.currentPersonIndex >= this.maxPersonIndex;
    while (isLevelInLimit && isAllPersonLooked && this.isNotEmptyLevel) {
        this.createNextFriendsCircle();
        this.currentLevel++;
        isLevelInLimit = this.currentLevel < this.maxLevel;
        isAllPersonLooked = this.currentPersonIndex >= this.maxPersonIndex;
    }

    return !(this.isNotEmptyLevel && this.currentLevel < this.maxLevel);
};

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    console.info('Filter');
}

Filter.prototype.customFilter = function () {
    return function () {
        return true;
    };
};

/**
 * Фильтр по полу
 * @constructor
 * @param {String} gender
 */
function GenderFilter(gender) {
    console.info('GenderFilter');
    this.gender = gender;
}
GenderFilter.prototype = Object.create(Filter.prototype);
GenderFilter.prototype.constructor = GenderFilter;
GenderFilter.prototype.customFilter = function () {
    return function (person) {
        return person.gender === this.gender;
    }.bind(this);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    console.info('MaleFilter');
    GenderFilter.call(this, 'male');
}
MaleFilter.prototype = Object.create(GenderFilter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    console.info('FemaleFilter');
    GenderFilter.call(this, 'female');
}
FemaleFilter.prototype = Object.create(GenderFilter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
