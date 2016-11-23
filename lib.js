'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 */
function Iterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }

    var depth = maxLevel || -1;
    var book = createBook(friends);
    var index = 0;
    var bestFriends = friends.filter(function (friend) {
        return friend.best;
    }).map(function (friend) {
        return friend.name;
    });
    var invitedFriends = inviteFriends(bestFriends, book, filter, depth);

    this.next = function () {
        if (this.done) {
            return null;
        }

        var name = invitedFriends[index++];
        for (var i = 0; i < friends.length; i++) {
            if (friends[i].name === name) {
                return friends[i];
            }
        }
    };

    this.done = function () {
        return index >= invitedFriends.length;
    };
}

function createBook(friends) {
    return friends.reduce(function (book, friend) {
        book[friend.name] = {
            friends: friend.friends,
            gender: friend.gender
        };

        return book;
    }, {});
}

function getAllFriends(people, book) {

    return people.reduce(function (allFriends, friend) {
        return allFriends.concat(book[friend].friends);
    }, []);
}

function filterCollection(nextInvitedFriends, invited) {

    return nextInvitedFriends.filter(function (friend) {
        return invited.indexOf(friend) === -1;
    });
}

function inviteFriends(bestFriends, book, filter, depth) {
    var invited = filter.filter(bestFriends, book);
    invited.sort();

    var allFriends = bestFriends;
    depth--;

    while (depth !== 0) {
        allFriends = getAllFriends(allFriends, book);
        var nextInvitedFriends = filter.filter(allFriends, book);
        nextInvitedFriends = filterCollection(nextInvitedFriends, invited);
        if (nextInvitedFriends.length === 0) {
            break;
        }
        invited = invited.concat(nextInvitedFriends);
        depth--;
    }

    return invited;
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
    Iterator.call(this, friends, filter, maxLevel);
}

/**
 * Фильтр друзей
 * @constructor
 * @param {String} gender
 */
function Filter(gender) {
    this.gender = gender;
    this.filter = function (invited, book) {
        var inv = invited.filter(function (friend) {
            return book[friend].gender === gender;
        });
        inv.sort();

        return inv;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Filter.call(this, 'male');
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Filter.call(this, 'female');
}

FemaleFilter.prototype = Filter.prototype;
MaleFilter.prototype = Filter.prototype;
LimitedIterator.prototype = Iterator.prototype;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
