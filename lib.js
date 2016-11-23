'use strict';

var levels = {
    level: undefined,
    friends: undefined
};

function functionCompareByName(friend, friendNext) {

    return friend.name > friendNext.name ? 1 : -1;
}

function choiceFriendsOnLevel(friends) {
    var friendsBest = Object.create(levels);
    var sortFriends = [];
    var namesPeopleChoiceFriends = [];
    var noInviteFriends = [];
    var nameChoiceFriends = [];
    friendsBest.level = 0;
    friendsBest.friends = friends.filter(function (item) {
        if (item.best !== undefined) {
            choiceFriend(item, namesPeopleChoiceFriends);
            nameChoiceFriends.push(item.name);

            return true;
        }
        noInviteFriends.push(item);

        return false;
    }).sort(functionCompareByName);
    sortFriends.push(friendsBest);
    var iteration = 1;
    while (nameChoiceFriends.length !== friends.length) {
        var friendsLevel = Object.create(levels);
        friendsLevel.level = iteration;
        var choiceFriends = [];
        var name = [];
        inspection(noInviteFriends, namesPeopleChoiceFriends, nameChoiceFriends, choiceFriends, name);
        name.forEach(function (item) {
            namesPeopleChoiceFriends.push(item);
        });
        friendsLevel.friends = choiceFriends.sort(functionCompareByName);
        sortFriends.push(friendsLevel);
        iteration++;
    }

    return sortFriends;
}

function inspection(noInviteFriends, namesPeopleChoiceFriends, nameChoiceFriends, choiceFriends, name) {
    for (var index = 0; index < noInviteFriends.length; index++) {
        var indexNamePeople = namesPeopleChoiceFriends.indexOf(noInviteFriends[index].name);
        if (nameChoiceFriends.indexOf(noInviteFriends[index].name) === -1) {
            if (indexNamePeople !== -1) {
                choiceFriends.push(noInviteFriends[index]);
                nameChoiceFriends.push(noInviteFriends[index].name);
                noInviteFriends[index].friends.forEach(function (nameFriendItem) {
                    name.push(nameFriendItem);
                });
            }
        }
    }
}

function choiceFriend(item, namesPeopleChoiceFriends) {
    item.friends.forEach(function (nameFriendItem) {
        namesPeopleChoiceFriends.push(nameFriendItem);
    });
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    console.info(friends, filter);
    if (!(filter instanceof Filter)) {
        throw new TypeError('Filter не является прототипом filter');
    }
    this.inviteFriends = function () {

        return filterFriendsByGender(choiceFriendsOnLevel(friends), filter, Infinity);
    };
    this.indexFriend = 0;
}

function filterFriendsByGender(friends, filter, maxLevel) {
    var friendsFilter = [];
    friends.forEach(function (item) {
        item.friends.forEach(function (friend) {
            if (filter.field(friend)) {
                if (item.level < maxLevel) {
                    friendsFilter.push(friend);
                }
            }
        });
    });

    return friendsFilter;
}

Iterator.prototype.done = function () {

    return this.indexFriend === this.inviteFriends().length;
};

Iterator.prototype.next = function () {
    if (this.done()) {

        return null;
    }
    this.indexFriend++;

    return this.inviteFriends()[this.indexFriend - 1];
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
    console.info(friends, filter, maxLevel);
    this.inviteFriends = function () {

        return filterFriendsByGender(choiceFriendsOnLevel(friends), filter, maxLevel);
    };
    this.indexFriend = 0;
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
    console.info('Filter');
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
    console.info('MaleFilter');
    this.field = allFilters.aMaleFilter;
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    console.info('FemaleFilter');
    this.field = allFilters.aFemaleFilter;
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
