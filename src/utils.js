const userAgentParser = require('ua-parser-js');

const alphabet = '123456789abcdefghkmnpqrstuvwxyz'.split('');
const generateRandomId = length => {
    let id = '';
    for (let i = 0; i < length; i++) {
        const letter = alphabet[Math.round((alphabet.length - 1) * Math.random())];
        id = id + letter;
    }
    return id;
};

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

module.exports = {
    generateRandomId,
    getUserAgentData
};