const moment = require('moment');
const {getVisitsFromTo} = require('./model');
const {getDates} = require('./utils');

async function generateStatistics(linkId, from, to) {
    const visits = await getVisitsFromTo(linkId, from, to);

    const browsersTotal = {},
        devicesTotal = {},
        referrersTotal = {},
        utmsTotal = {},
        daysTotal = {},
        daytimeTotal = {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
            '13': 0,
            '14': 0,
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0,
            '19': 0,
            '20': 0,
            '21': 0,
            '22': 0,
            '23': 0
        },
        weekdayTotal = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
        };

    getDates(from, to).forEach(date => daysTotal[moment(date).format('YYYY-MM-DD')] = 0);

    visits.forEach(visit => {
        const browser = `${visit.browserName}`;
        const device = `${visit.deviceType}`;
        const referrer = visit.referrer;
        const utm = `${visit.utm_source} ${visit.utm_medium} ${visit.utm_campaign}`;
        if (!browsersTotal.hasOwnProperty(browser)) browsersTotal[browser] = 0;
        if (!devicesTotal.hasOwnProperty(device)) devicesTotal[device] = 0;
        if (!referrersTotal.hasOwnProperty(referrer)) referrersTotal[referrer] = 0;
        if (!utmsTotal.hasOwnProperty(utm)) utmsTotal[utm] = 0;
        browsersTotal[browser]++;
        devicesTotal[device]++;
        referrersTotal[referrer]++;
        utmsTotal[utm]++;
        daytimeTotal[moment(visit.date).format('H')]++;
        weekdayTotal[moment(visit.date).format('E')]++;
        daysTotal[moment(visit.date).format('YYYY-MM-DD')]++;
    });

    function toPercentages(totals) {
        return Object.keys(totals).map(property => ({
            property,
            percentage: totals[property] === 0 ? 0 : totals[property] / visits.length
        }))
    }

    function toAbsolutes(totals) {
        return Object.keys(totals).map(name => ({
            name,
            value: totals[name]
        }))
    }

    return {
        from,
        to,
        visits,
        totalVisits: visits.length,
        browsers: toPercentages(browsersTotal),
        devices: toPercentages(devicesTotal),
        referrers: toPercentages(referrersTotal),
        utms: toPercentages(utmsTotal),
        visitsPerDaytime: toPercentages(daytimeTotal),
        visitsPerWeekday: toPercentages(weekdayTotal),
        dates: toAbsolutes(daysTotal)
    }
}

module.exports = {
    generateStatistics
};