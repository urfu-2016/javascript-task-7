'use strict';

var levels = {
    level: undefined,
    friends: undefined,
    names: undefined
};

function functionCompareByName(friend, friendNext) {

    return friend.name > friendNext.name ? 1 : -1;
}

function onlyConnectedFriends(allFriends) {
    var allFriendsFriends = [];
    allFriends.forEach(function (item) {
        item.friends.forEach(function (friendItem) {
            allFriendsFriends.push(friendItem);
        });
    });

    return allFriendsFriends;
}

function findBestFriends(arg, allFriends, noInviteFriends) {
    var namesAllPeople = arg[0];
    var friendsOnLevel = arg[1];
    var namesPeopleChoiceFriends = arg[2];
    var friends = [];
    var friendsFriendsOnLevel = [];
    friendsOnLevel.friends = allFriends.filter(function (item) {
        if (item.best) {
            choiceFriend(item, friendsFriendsOnLevel);
            friends.push(item);

            return true;
        }
        if (namesAllPeople.indexOf(item.name) !== -1) {
            friends.push(item);
            noInviteFriends.push(item);
        }

        return false;

    }).sort(functionCompareByName);
    friendsOnLevel.names = friendsFriendsOnLevel;

    return friends;
}

function choiceFriendsOnLevel(allFriends, maxLevel) {
    var friendsOnLevel = Object.create(levels);
    var sortFriends = [];
    var noInviteFriends = [];
    friendsOnLevel.level = 0;
    var namesAllPeople = onlyConnectedFriends(allFriends);
    var argument1 = [namesAllPeople, friendsOnLevel];
    var friends = findBestFriends(argument1, allFriends, noInviteFriends);
    sortFriends.push(friendsOnLevel);
    var argument2 = [noInviteFriends, friends, sortFriends];
    findFriends(argument2, maxLevel);

    return sortFriends;
}

function findFriends(arg, maxLevel) {
    var noInviteFriends = arg[0];
    var friends = arg[1];
    var sortFriends = arg[2];
    var iteration = 1;
    while(noInviteFriends.length !== 0) {
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
    for (var i = 0; i < noInviteFriends.length; i++) {
        var  namesFriendLevel = sortFriends[iteration-1].names;
        var indexNamePeople = namesFriendLevel.indexOf(noInviteFriends[i].name);
        if (indexNamePeople !== -1) {
            choiceFriends.push(noInviteFriends[i]);
            choiceFriend(noInviteFriends[i], namesFriends);
            noInviteFriends.splice(i, 1);
            i--;
        }
    }
    friendsLevel.names = namesFriends;
}

function choiceFriend(item, friendsFriendsOnLevel) {
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
    var maxLevel = arguments[2] === undefined ? Infinity : arguments[2];
    var workWithFriends = choiceFriendsOnLevel(friends, maxLevel);
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
    aFilter: true,
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
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.field = allFilters.aFemaleFilter;
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
