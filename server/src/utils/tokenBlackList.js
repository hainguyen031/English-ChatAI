//blacklist luu cac token bi vo hieu hoa
const tokenBlackList = new Set();
//Them token vao blacklist
const addToBlacklist = (token) => tokenBlackList.add(token);

//Kiem tra token co trong blacklist
const isTokenBlacklist = (token) => tokenBlackList.has(token);

//xoa token khoi blacklist
const removeFromBlacklist = (token) => tokenBlackList.remove(token);

module.exports = {
    addToBlacklist,
    isTokenBlacklist,
    removeFromBlacklist,
}