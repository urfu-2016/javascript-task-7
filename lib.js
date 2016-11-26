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
    this.addedFriendsNames = [];
    this.addBestFriends(friends);
    this.filteredAndSortedFriend = this.bypassFriend(friends,
        this.maxLevel ? this.maxLevel : Infinity
    );
}

Iterator.prototype.filterRepeat = function (friendsNames) {
    return friendsNames.filter(function (friendsName) {
        return this.addedFriendsNames.indexOf(friendsName) === -1;
    }, this);
};

Iterator.prototype.addFoundedFriends = function (foundedFriends) {
    foundedFriends.forEach(function (foundedFriend) {
        if (this.addedFriendsNames.indexOf(foundedFriend.name) === -1) {
            this.addedFriends.push(foundedFriend);
            this.addedFriendsNames.push(foundedFriend.name);
        }
    }, this);
};

Iterator.prototype.bypassFriend = function (friends, maxLevel) {
    var countProcessed = 0;
    var countLevel = 1;
    var friendsNames = [];
    var foundedFriends = [];
    while (countLevel !== maxLevel && countProcessed < this.addedFriends.length) {
        while (countProcessed !== this.addedFriends.length) {
            friendsNames = this.addedFriends[countProcessed].friends;
            friendsNames = this.filterRepeat(friendsNames);
            friendsNames.forEach(function (nameCurrentFriend) {
                friends.forEach(function (friend) {
                    if (friend.name === nameCurrentFriend) {
                        foundedFriends.push(friend);
                    }
                });
            });
            countProcessed++;
        }
        this.addFoundedFriends(sortCollection(foundedFriends));
        countLevel++;
    }
    this.addedFriends = this.filter.filterOnGender(this.addedFriends);
    this.addedFriendsNames = this.getNameFrends(this.addedFriends);

    return maxLevel !== 0 ? this.filter.filterOnGender(this.addedFriends) : [];
};

Iterator.prototype.getNameFrends = function getNameFrends() {
    return this.addedFriends.map(function (addedFriend) {
        return addedFriend.name;
    });
};

Iterator.prototype.addBestFriends = function (friends) {
    this.addedFriends = sortCollection(friends.filter(function (friend) {
        return friend.best;
    }));
    this.addedFriendsNames = this.getNameFrends(this.addedFriends);
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
    this.propertyFilter = '';
}

Filter.prototype.filterOnGender = function (friends) {
    return friends.filter(function (friend) {
        return friend.gender === this.propertyFilter || this.propertyFilter === '';
    }, this);
};

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
