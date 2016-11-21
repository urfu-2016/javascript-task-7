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
    this.visited = this.sortedCircleOfFriends.map(function (person) {
        return person.name;
    });
    this.hasRound = this.sortedCircleOfFriends.length > 0;
    this.createFilteredFriends();
}

Iterator.prototype.compareFriends = function (friend1, friend2) {
    return friend1.name.localeCompare(friend2.name);
};

Iterator.prototype.createFilteredFriends = function () {
    this.filteredFriends = this.sortedCircleOfFriends.filter(this.filterObject.customFilter());
    this.current = 0;
    this.last = this.filteredFriends.length;
};

Iterator.prototype.fromNameToFriendObj = function (names) {
    return this.allFriends.filter(function (friend) {
        return names.indexOf(friend.name) !== -1;
    });
};

Iterator.prototype.createNextFriendsRound = function () {
    var thisIterator = this;
    var nextFriendsNames = this.sortedCircleOfFriends.reduce(function (nextFriends, friend) {
        friend.friends.forEach(function (friendName) {
            if (nextFriends.indexOf(friendName) === -1 &&
                thisIterator.visited.indexOf(friendName) === -1) {
                nextFriends.push(friendName);
                thisIterator.visited.push(friendName);
            }
        });

        return nextFriends;
    }, []);
    this.sortedCircleOfFriends = this.fromNameToFriendObj(nextFriendsNames)
                                     .sort(this.compareFriends);
    this.hasRound = this.sortedCircleOfFriends.length > 0;
    this.createFilteredFriends();
};

Iterator.prototype.done = function () {
    if (!this.hasRound) {
        return true;
    }
    while (this.current >= this.last && this.hasRound) {
        this.createNextFriendsRound();
    }

    return !this.hasRound;
};

Iterator.prototype.next = function () {
    var nextFriend = this.done() ? null : this.filteredFriends[this.current];
    this.current++;

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
    if (!this.hasRound || this.currentLevel >= this.maxLevel) {
        return true;
    }
    while (this.currentLevel < this.maxLevel && this.current >= this.last && this.hasRound) {
        this.createNextFriendsRound();
        this.currentLevel++;
    }

    return !(this.hasRound && this.currentLevel < this.maxLevel);
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
    var this_ = this;

    return function (person) {
        return person.gender === this_.gender;
    };
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
