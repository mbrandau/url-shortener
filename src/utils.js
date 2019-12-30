const userAgentParser = require('ua-parser-js');
const {AuthenticationError} = require('apollo-server-errors');
const config = require('../config');

const blacklistRegex = new RegExp(config.ids.generatorBlacklistRegex);
const alphabet = config.ids.alphabet.split('');
const generateRandomId = length => {
    let id = '';
    for (let i = 0; i < length; i++) {
        const letter = alphabet[Math.floor((alphabet.length - 1) * Math.random())];
        id = id + letter;
    }

    // Don’t use blacklisted ids
    while (blacklistRegex.test(id) || config.ids.generatorBlacklist.indexOf(id) >= 0 || config.ids.generalBlacklist.indexOf(id) >= 0)
        id = generateRandomId(length);

    return sanitizeId(id);
};

function isAuthorized(token, action) {
    if (config.access[action].indexOf('public') >= 0) return true;
    return config.access[action].indexOf(token) >= 0;
}

function requireAuthorization(token, action) {
    if (!isAuthorized(token, action)) throw new AuthenticationError('Not authorized');
}

function getUserAgentData(userAgentString) {
    const userAgent = userAgentParser(userAgentString);
    return {
        browserName: userAgent.browser.name,
        browserVersion: userAgent.browser.name,
        deviceType: userAgent.device.type,
        deviceVendor: userAgent.device.vendor,
        deviceModel: userAgent.device.model,
        engineName: userAgent.engine.name,
        engineVersion: userAgent.engine.version,
        osName: userAgent.os.name,
        osVersion: userAgent.os.version,
        architecture: userAgent.cpu.architecture
    }
}

function sanitizeId(id) {
    if (typeof id !== 'string') return id;
    if (config.ids.caseSensitive !== true) id = id.toLowerCase();
    if (config.ids.generalBlacklist.indexOf(id) >= 0) throw new Error('id blacklisted');
    return id;
}

function addDays(date, days) {
    const dat = new Date(date);
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getDates(startDate, endDate) {
    const dateArray = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
        dateArray.push(currentDate);
        currentDate = addDays(currentDate, 1);
    }
    return dateArray;
}

module.exports = {
    generateRandomId,
    isAuthorized,
    requireAuthorization,
    getUserAgentData,
    sanitizeId,
    getDates
};