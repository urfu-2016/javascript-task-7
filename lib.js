'use strict';

/*
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this.filter = filter;
    this.index = 0;
    this.addedFriends = [];
    this.addedNameFriends = [];

    this.filterRepeat = function (nameCurrentFriends) {
        return nameCurrentFriends.filter(function (nameCurrentFriend) {
            return this.addedNameFriends.indexOf(nameCurrentFriend) === -1;
        }, this);
    };

    this.addFindedFriends = function (findedFriends) {
        findedFriends.forEach(function (findedFriend) {
            if (this.isNotInvitedFriend(findedFriend)) {
                this.addedFriends.push(findedFriend);
                this.addedNameFriends.push(findedFriend.name);
            }
        }, this);
    };

    this.isNotInvitedFriend = function (friend) {
        return this.addedNameFriends.indexOf(friend.name) === -1;
    };

    this.roundFriend = function (friendsWithoutRounds, maxLevel) {
        var indCurentFriend = 0;
        var countRound = 1;
        var nameCurrentFriends = [];
        var findedFriends = [];
        while (countRound !== maxLevel && indCurentFriend < this.addedFriends.length) {
            while (indCurentFriend !== this.addedFriends.length) {
                nameCurrentFriends = this.addedFriends[indCurentFriend].friends;
                nameCurrentFriends = this.filterRepeat(nameCurrentFriends);
                nameCurrentFriends.forEach(function (nameCurrentFriend) {
                    friendsWithoutRounds.forEach(function (friend) {
                        if (friend.name === nameCurrentFriend) {
                            findedFriends.push(friend);
                        }
                    });
                });
                indCurentFriend++;
            }
            this.addFindedFriends(sortCollection(findedFriends));
            countRound++;
        }
        this.addedFriends = this.filter.filterFunction(this.addedFriends);
        this.addedNameFriends = this.getNameFrends(this.addedFriends);

        return maxLevel !== 0 ? this.filter.filterFunction(this.addedFriends) : [];
    };

    this.getNameFrends = function getNameFrends() {
        return this.addedFriends.map(function (addedFriend) {
            return addedFriend.name;
        });
    };

    this.addBestFriends = function () {
        this.addedFriends = sortCollection(friends.filter(function (friend) {
            return Boolean(friend.best);
        }));
        this.addedNameFriends = this.getNameFrends(this.addedFriends);
    };


    if (!(filter instanceof Filter)) {
        throw new TypeError('Неверный тип фильтра');
    }
    this.addBestFriends(friends);
    this.all = this.roundFriend(friends, this.maxLevel !== undefined
        ? this.maxLevel : Number.POSITIVE_INFINITY
    );
}

Iterator.prototype.done = function () {
    return this.all.length <= this.index;
};

Iterator.prototype.next = function () {
    var nextFriend = this.all[this.index];
    this.index++;

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
    if (maxLevel === undefined || maxLevel < 1) {
        this.maxLevel = 0;
    } else {
        this.maxLevel = maxLevel;
    }
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

Filter.prototype.filter = function (friend) {
    return friend.gender === this.propertyFilter || this.propertyFilter === '';
};

Filter.prototype.filterFunction = function (friends) {
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
