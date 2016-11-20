'use strict';

/**
 * Клонировать коллекцию объектов
 * @param {Array<Object>} collection - исходная коллекция
 * @returns {Array} - клон коллекции
 */
function cloneObjectCollection(collection) {
    return collection.map(function (element) {
        return Object.assign({}, element);
    });
}

/**
 * Почти граф, который позволяет делать
 * обход в ширину, по кругам друзей
 * @param {Array} friends - все друзья
 * @constructor
 */
function FriendsGraph(friends) {
    this.waveNumber = 0;
    this.friendsDict = cloneObjectCollection(friends)
        .reduce(function (dict, friend) {
            dict[friend.name] = friend;

            return dict;
        }, Object.create(null));

    /**
     * Возвращает всех лучших друзей
     * @returns {Array.<*>}
     */
    this.getBesties = function () {
        var besties = Object.keys(this.friendsDict)
            .filter(function (friendName) {
                return this.friendsDict[friendName].best;
            }, this)
            .map(function (friendName) {
                return this.friendsDict[friendName];
            }, this);
        besties.forEach(function (bestFriend) {
            delete this.friendsDict[bestFriend.name];
        }, this);

        return besties;
    };

    /**
     * Считаем следующую волну
     * @returns {Array} - следующая волна
     */
    this.getNextWave = function () {
        var dict = this.friendsDict;

        return this.currentWave.reduce(function (wave, friend) {
            friend.friends.forEach(function (friendOfFriend) {
                if (friendOfFriend in dict) {
                    wave.push(dict[friendOfFriend]);
                    delete dict[friendOfFriend];
                }
            });

            return wave;
        }, []);
    };

    this.currentWave = null;
    this.nextWave = this.getBesties();

    this.done = function () {
        return this.nextWave.length === 0;
    };

    this.next = function () {
        if (this.done()) {
            return null;
        }
        this.currentWave = this.nextWave.sort(function (a, b) {
            return a.name > b.name ? 1 : -1;
        });
        this.nextWave = this.getNextWave();
        this.waveNumber++;

        return this.currentWave;
    };
}

/**
 * Ленивый итератор по друзьям
 * Итерируется без учета порядка
 * @constructor
 * @param {Object[]} friends - массив друзей
 * @param {Filter} filter - фильтр друзей
 */
function FilteredIterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this.stack = friends.reverse();
    this.filter = filter;
}

FilteredIterator.prototype.next = function () {
    var friend = this.stack.pop();
    while (friend !== undefined && !this.filter.test(friend)) {
        friend = this.stack.pop();
    }

    return friend ? friend : null;
};

FilteredIterator.prototype.done = function () {
    var friend = this.next();
    if (friend) {
        this.stack.push(friend);
    }

    return friend === null;
};

/**
 * Ленивый итератор по друзьям
 * с хорошим порядком обхода (Как хочет Билли)
 * @constructor
 * @param {Object[]} friends - массив друзей
 * @param {Filter} filter - фильтр друзей
 */
function Iterator(friends, filter) {
    this.filter = filter;
    this.graph = new FriendsGraph(friends);
    this.currentWaveIterator = new FilteredIterator(
        this.graph.next(), filter
    );
}

Iterator.prototype.done = function () {
    return this.currentWaveIterator.done() && this.graph.done();
};

Iterator.prototype.next = function () {
    if (this.currentWaveIterator.done()) {
        this.currentWaveIterator = new FilteredIterator(
            this.graph.next(), this.filter
        );
    }
    if (this.done()) {
        return null;
    }

    return this.currentWaveIterator.next();
};

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends - все друзья
 * @param {Filter} filter - фильтр
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);

    this.done = function () {
        return this.graph.waveNumber > maxLevel ||
            (this.graph.waveNumber + 1 > maxLevel && this.currentWaveIterator.done()) ||
            Iterator.prototype.done.call(this);
    };

    this.next = function () {
        if (this.done()) {
            return null;
        }

        return Iterator.prototype.next.call(this);
    };
}

/**
 * Фильтр друзей
 * @constructor
 * @param {Function} filterFunction - фильтрующая функция
 */
function Filter(filterFunction) {
    this.testFunction = filterFunction;
    if (!filterFunction) {
        this.testFunction = function () {
            return true;
        };
    }
}

Filter.prototype.test = function (friend) {
    return this.testFunction(friend);
};

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    var filterFunction = function (element) {
        return element.gender === 'male';
    };
    Filter.call(this, filterFunction);
}

FemaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    var filterFunction = function (element) {
        return element.gender === 'female';
    };
    Filter.call(this, filterFunction);
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;

exports.Graph = FriendsGraph;
