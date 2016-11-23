'use strict';

function getFilteredFriends(friendsCircles, filter, maxLevel) {
    var filteredFriends = [];
    friendsCircles.slice(0, maxLevel).forEach(function (circle) {
        circle.forEach(function (friend) {
            if (filter.filterFunction(friend)) {
                filteredFriends.push(friend);
            }
        });
    });

    return filteredFriends;
}


function getCirclesOfFriends(friends) {
    var circlesOfFriends = [[]];
    var checkedNames = [];

    friends.forEach(function (friend) {
        if (friend.best === true) {
            circlesOfFriends[0].push(friend);
            checkedNames.push(friend.name);
        }
    });

    for (var i = 0; i < circlesOfFriends.length; i++) {
        createNewCircle(i);
    }

    // В отдельной функции тк " Don't make functions within a loop"
    function createNewCircle(circleId) {
        var newCircle = [];
        circlesOfFriends[circleId].forEach(function (friend) {
            friend.friends.forEach(function (name) {
                if (checkedNames.indexOf(name) === -1) {
                    checkedNames.push(name);
                    newCircle.push(findFriendByName(friends, name));
                }
            });
        });
        if (newCircle.length) {
            circlesOfFriends.push(newCircle);
        }
    }

    return circlesOfFriends;
}

function findFriendByName(friends, name) {
    var newFriend;
    friends.forEach(function (friend) {
        if (friend.name === name) {
            newFriend = friend;
        }
    });

    return newFriend;
}


/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }

    this.circlesOfFriends = getCirclesOfFriends(friends);
    this.circlesOfFriends.forEach(function (circle) {
        circle.sort(function (one, another) {
            return one.name > another.name ? 1 : -1;
        });
    });
    this.sortedCircles = this.circlesOfFriends;

    this.filteredFriends = getFilteredFriends(
        this.sortedCircles,
        filter,
        this.sortedCircles.length
    );
    this.currentIndex = 0;

}

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    this.currentIndex++;

    return this.filteredFriends[this.currentIndex - 1];
};

Iterator.prototype.done = function () {
    return this.currentIndex === this.filteredFriends.length;
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
    Iterator.call(this, friends, filter);
    this.filteredFriends = getFilteredFriends(this.sortedCircles, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filterFunction = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filterFunction = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filterFunction = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
