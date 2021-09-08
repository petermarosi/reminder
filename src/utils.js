function findItemByName(cache, name) {
    return cache.find(item => item.name === name);
}

function findItemById(cache, id) {
    return cache.find(item => item.id === id);
}

exports.findItemByName = findItemByName;
exports.findItemById = findItemById;