'use strict';

function checkNeighbors(queueOfFriends, visitedFriends, friendNameToFriendObj) {
    var node = queueOfFriends[0];
    queueOfFriends = queueOfFriends.slice(1);
    var neighbors = node.friends;
    for (var i = 0; i < neighbors.length; i++) {
        if (neighbors[i] in visitedFriends) {
            continue;
        }
        visitedFriends[neighbors[i]] = visitedFriends[node.name] + 1;
        queueOfFriends.push(friendNameToFriendObj[neighbors[i]]);
    }

    return { queueOfFriends: queueOfFriends, visitedFriends: visitedFriends };
}

function bfs(queueOfFriends, visitedFriends, friendNameToFriendObj) {
    while (queueOfFriends.length > 0) {
        var resultOfCheck = checkNeighbors(queueOfFriends, visitedFriends, friendNameToFriendObj);
        queueOfFriends = resultOfCheck.queueOfFriends;
        visitedFriends = resultOfCheck.visitedFriends;
    }

    return visitedFriends;
}

function searchWaves(friends) {
    var visitedFriends = {};
    var queueOfFriends = friends.filter(function (friend) {
        return friend.hasOwnProperty('best') && friend.best;
    });
    if (queueOfFriends.length === 0) {
        return {};
    }
    var friendNameToFriendObj = {};
    friends.forEach(function (friendObj) {
        friendNameToFriendObj[friendObj.name] = friendObj;
    });
    queueOfFriends.forEach(function (friend) {
        visitedFriends[friend.name] = 1;
    });

    return bfs(queueOfFriends, visitedFriends, friendNameToFriendObj);
}

function swapKeyWithValue(objectKeyToValue) {
    var objectValueToKey = {};
    Object.keys(objectKeyToValue).forEach(function (friend) {
        if (objectValueToKey.hasOwnProperty(objectKeyToValue[friend])) {
            objectValueToKey[objectKeyToValue[friend]].push(friend);
        } else {
            objectValueToKey[objectKeyToValue[friend]] = [friend];
        }
    });

    return objectValueToKey;
}

function getFilteredFriends(visitedFriendsSwapped, filter, friends, visitedFriends) {
    var filteredFriends = [];
    Object.keys(visitedFriendsSwapped).forEach(function (numberWave) {
        filteredFriends = filteredFriends.concat(visitedFriendsSwapped[numberWave].sort());
    });
    filteredFriends = filteredFriends.map(function (friendName) {
        var friendObj;
        friends.forEach(function (friend) {
            if (friend.name === friendName) {
                friendObj = { friend: friend, numberWave: visitedFriends[friendName] };
            }
        });

        return friendObj;
    }).filter(filter.filter);

    return filteredFriends;
}

function getWavesFriends(friends, filter, wavesLimit) {
    var visitedFriends = searchWaves(friends);
    if (!Object.keys(visitedFriends).length) {
        return [];
    }

    //  это надо, чтобы в каждой волне отсортировать друзей по имени
    var visitedFriendsSwapped = swapKeyWithValue(visitedFriends);
    var filteredFriends = getFilteredFriends(visitedFriendsSwapped, filter,
                                             friends, visitedFriends);

    var limitedFriends = [];
    if (typeof wavesLimit === 'undefined') {
        wavesLimit = filteredFriends[filteredFriends.length - 1].numberWave;
    } else {
        wavesLimit = wavesLimit > 0 ? wavesLimit : 0;
    }

    //  console.info(filteredFriends);
    filteredFriends.forEach(function (friendObj) {
        if (friendObj.numberWave <= wavesLimit) {
            limitedFriends.push(friendObj.friend);
        }
    });

    return limitedFriends;
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

    this.filteredFriends = getWavesFriends(friends, filter, undefined);
    var currentFriend = 0;

    this.done = function () {
        return currentFriend === this.filteredFriends.length;
    };

    this.next = function () {
        if (this.done()) {
            return null;
        }
        currentFriend++;

        return this.filteredFriends[currentFriend - 1];
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
    Iterator.call(this, friends, filter);
    this.filteredFriends = getWavesFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    console.info('Filter');

    this.filter = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    console.info('MaleFilter');

    this.filter = function (friendObj) {
        return friendObj.friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    console.info('FemaleFilter');

    this.filter = function (friendObj) {
        return friendObj.friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
