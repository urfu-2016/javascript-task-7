'use strict';

/*
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Неверный тип фильтра');
    }
    this.filter = filter;
    this.currentFriendIndex = 0;
    this.addedFriends = [];
    this.addBestFriends(friends);
    this.filteredAndSortedFriend = this.bypassFriend(friends,
        this.maxLevel !== undefined ? this.maxLevel : Infinity
    );
}

Iterator.prototype.isNotAdded = function (friendsName, collection) {
    return collection.every(function (friend) {
        return friend.name !== friendsName;
    });
};

Iterator.prototype.addFoundFriends = function (foundFriends) {
    foundFriends.forEach(function (foundFriend) {
        if (this.isNotAdded(foundFriend.name, this.addedFriends)) {
            this.addedFriends.push(foundFriend);
        }
    }, this);
};

function makeMap(friends) {
    var map = {};
    friends.forEach(function (friend) {
        map[friend.name] = friend;
    });

    return map;
}

Iterator.prototype.bypassFriend = function (friends, maxLevel) {
    var countProcessed = 0;
    var countLevel = 1;
    var friendsNames = [];
    var foundFriends = [];
    var friendsMap = makeMap(friends);
    var iterFriendNames = function (names) {
        names.forEach(function (friendsName) {
            if (friendsName in friendsMap) {
                foundFriends.push(friendsMap[friendsName]);
                delete friendsMap[friendsName];
            }
        });
    };
    while (countLevel !== maxLevel && countProcessed < this.addedFriends.length) {
        while (countProcessed !== this.addedFriends.length) {
            friendsNames = this.addedFriends[countProcessed].friends;
            iterFriendNames(friendsNames);
            countProcessed++;
        }
        this.addFoundFriends(sortCollection(foundFriends));
        countLevel++;
    }
    this.addedFriends = this.filter.filterOnGender(this.addedFriends);

    return maxLevel !== 0 ? this.filter.filterOnGender(this.addedFriends) : [];
};

Iterator.prototype.addBestFriends = function (friends) {
    this.addedFriends = sortCollection(friends.filter(function (friend) {
        return friend.best;
    }));
};

Iterator.prototype.done = function () {
    return this.filteredAndSortedFriend.length <= this.currentFriendIndex;
};

Iterator.prototype.next = function () {
    var nextFriend = this.filteredAndSortedFriend[this.currentFriendIndex];
    this.currentFriendIndex++;

    return nextFriend ? nextFriend : null;
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
    this.maxLevel = !maxLevel || maxLevel < 0 ? 0 : maxLevel;
    Iterator.call(this, friends, filter);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

function sortCollection(collection) {
    return collection.sort(function (a, b) {
        return a.name > b.name ? 1 : -1;
    });
}

/*
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.genderFilter = '';
}

Filter.prototype.filterOnGender = function (friends) {
    return !this.genderFilter ? friends : friends.filter(function (friend) {
        return friend.gender === this.genderFilter;
    }, this);
};

/*
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.genderFilter = 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);

/*
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.genderFilter = 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
