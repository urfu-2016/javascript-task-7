'use strict';

// function removeFriendsNamesMatches(friendNamesAndLevels, potentiallyFriendsNames) {
//     return potentiallyFriendsNames.filter(function (potentiallyFriendName) {
//         return !friendNamesAndLevels.some(function (friendNameAndLevel) {
//             return friendNameAndLevel.name === potentiallyFriendName;
//         });
//     });
// }

function getNextFriendsCircleNames(friends, friendsNames, oldFriendsCircle) {
    return oldFriendsCircle.reduce(function (acc, friendName) {
        var nextCicleNames = getFriendByName(friendName, friends).friends.filter(function (friend) {
            return friendsNames.indexOf(friend) === -1;
        });
        // var nextCicleNames = friends.find(function (friend) {
        //     return friend.name === oldCircleFriendName;
        // }).friends;

        return acc.concat(nextCicleNames);
    }, []);
}

function getFriendByName(name, friends) {
    return friends.find(function (friend) {
        return friend.name === name;
    });
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

    var currentFriendsCircle = friends.filter(function (friend) {
        return friend.best;
    })
    .map(function (friend) {
        return friend.name;
    });
    var result = [];
    var currentLevel = 1;
    var friendsNames = [];
    while (currentFriendsCircle.length !== 0) {
        // currentFriendsCircle = removeFriendsNamesMatches(result, currentFriendsCircle)
        currentFriendsCircle = currentFriendsCircle.sort(function (a, b) {
            return a.localeCompare(b);
        });

        for (var i = 0; i < currentFriendsCircle.length; i++) {
            var friendName = currentFriendsCircle[i];
            result.push({
                level: currentLevel,
                name: friendName
            });
            friendsNames.push(friendName);
        }
        currentFriendsCircle = getNextFriendsCircleNames(friends, friendsNames,
            currentFriendsCircle);
        currentLevel++;
    }

    this.invitedFriends = result.map(function (nameAndLevel) {
        return {
            friend: getFriendByName(nameAndLevel.name, friends),
            level: nameAndLevel.level
        };
    })
    .filter(function (item) {
        return filter.test(item.friend);
    });
}

Iterator.prototype.done = function () {
    return !this.invitedFriends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.invitedFriends.shift().friend;
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

    this.invitedFriends = this.invitedFriends.filter(function (item) {
        return item.level <= maxLevel;
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.test = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.test = function (item) {
        return item.gender === 'male';
    };
}
MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.test = function (item) {
        return item.gender === 'female';
    };
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
