'use strict';

var levels = {
    level: undefined,
    friends: undefined,
    names: undefined,
    namesLevel: undefined
};

function functionCompareByName(friend, friendNext) {

    return friend.name > friendNext.name ? 1 : -1;
}

function onlyConnectedFriends(allFriends) {
    var allFriendsFriends = [];
    allFriends.forEach(function (item) {
        if (item.friends === undefined || item.friends.indexOf(undefined) !== -1) {
            throw new TypeError('friends of ungefined');
        }
        item.friends.forEach(function (friendItem) {
            allFriendsFriends.push(friendItem);
        });
    });

    return allFriendsFriends;
}

function findBestFriends(arg, allFriends, noInviteFriends) {
    var namesAllPeople = arg[0];
    var friendsOnLevel = arg[1];
    var friendsFriendsOnLevel = [];
    var namesFriendsOnLevel = [];
    friendsOnLevel.friends = allFriends.filter(function (item) {
        if (item.best) {
            choiceFriend(item, friendsFriendsOnLevel, namesFriendsOnLevel);

            return true;
        }
        if (namesAllPeople.indexOf(item.name) !== -1) {
            noInviteFriends.push(item);
        }

        return false;

    }).sort(functionCompareByName);
    friendsOnLevel.names = friendsFriendsOnLevel;
    friendsOnLevel.namesLevel = namesFriendsOnLevel;
}

function choiceFriendsOnLevel(allFriends, maxLevel, filter) {
    if (maxLevel === undefined || maxLevel === 0) {
        if (filter.type !== 'female') {

            return [];
        }
        maxLevel = Infinity;
    }
    var friendsOnLevel = Object.create(levels);
    var sortFriends = [];
    var noInviteFriends = [];
    friendsOnLevel.level = 0;
    var namesAllPeople = onlyConnectedFriends(allFriends);
    var argument1 = [namesAllPeople, friendsOnLevel];
    findBestFriends(argument1, allFriends, noInviteFriends);
    sortFriends.push(friendsOnLevel);
    var argument2 = [noInviteFriends, sortFriends];
    findFriends(argument2, maxLevel);

    return sortFriends;
}

function findFriends(arg, maxLevel) {
    var noInviteFriends = arg[0];
    var sortFriends = arg[1];
    var iteration = 1;
    while (noInviteFriends.length !== 0) {
        if (iteration === maxLevel) {
            break;
        }
        var friendsLevel = Object.create(levels);
        friendsLevel.level = iteration;
        var choiceFriends = [];
        var argument = [noInviteFriends, sortFriends, friendsLevel];
        inspection(argument, iteration, choiceFriends);
        friendsLevel.friends = choiceFriends.sort(functionCompareByName);
        sortFriends.push(friendsLevel);
        iteration++;
    }
}

function inspection(arg, iteration, choiceFriends) {
    var noInviteFriends = arg[0];
    var sortFriends = arg[1];
    var friendsLevel = arg[2];
    var namesFriends = [];
    var namesOnLevel = [];
    for (var i = 0; i < noInviteFriends.length; i++) {
        var indexNamePeople = sortFriends[iteration - 1].names.indexOf(noInviteFriends[i].name);
        if (indexNamePeople !== -1) {
            checkTypeGraph(sortFriends, noInviteFriends[i], iteration);
            choiceFriends.push(noInviteFriends[i]);
            choiceFriend(noInviteFriends[i], namesFriends, namesOnLevel);
            noInviteFriends.splice(i, 1);
            i--;
        }
    }
    friendsLevel.names = namesFriends;
    friendsLevel.namesLevel = namesOnLevel;
}

function checkTypeGraph(sortFriends, item, iteration) {
    var index = 0;
    item.friends.forEach(function (friend) {
        if (sortFriends[iteration - 1].namesLevel.indexOf(friend) !== -1) {
            index++;
        }
    });
    if (index === 0 && item.friends.length !== 0) {
        throw new TypeError('Граф ориентированный');
    }
}

function choiceFriend(item, friendsFriendsOnLevel, namesFriendsOnLevel) {
    namesFriendsOnLevel.push(item.name);
    item.friends.forEach(function (nameFriendItem) {
        if (friendsFriendsOnLevel.indexOf(item.name) === -1) {
            friendsFriendsOnLevel.push(nameFriendItem);
        }
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
        throw new TypeError('Filter не является прототипом filter');
    }
    var workWithFriends = choiceFriendsOnLevel(friends, arguments[2], filter);
    this.inviteFriends = filterFriendsByGender(workWithFriends, filter);
    this.indexFriend = 0;
}

function filterFriendsByGender(friends, filter) {
    var friendsFilter = [];
    friends.forEach(function (item) {
        item.friends.forEach(function (friend) {
            if (filter.field(friend)) {
                friendsFilter.push(friend);
            }
        });
    });

    return friendsFilter;
}

Iterator.prototype.done = function () {

    return this.indexFriend === this.inviteFriends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {

        return null;
    }
    this.indexFriend++;

    return this.inviteFriends[this.indexFriend - 1];
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
    Iterator.call(this, friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

var allFilters = {
    aFilter: function () {

        return true;
    },
    aMaleFilter: function (friend) {

        return friend.gender === 'male';
    },
    aFemaleFilter: function (friend) {

        return friend.gender === 'female';
    }
};

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.field = allFilters.aFilter;
    this.type = 'filter';
}

Filter.prototype.apply = function () {

    return this.field.apply(null, arguments);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.field = allFilters.aMaleFilter;
    this.type = 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.field = allFilters.aFemaleFilter;
    this.type = 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
