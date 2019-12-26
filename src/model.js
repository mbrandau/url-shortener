const knex = require('./db');
const {generateRandomId, getUserAgentData} = require('./utils');
const {linkColumns} = require('./constants');

async function getAllLinks() {
    return knex.select(linkColumns).from('links')
}

async function getLinkById(id) {
    return knex('links')
        .first(linkColumns)
        .where('id', id)
}

async function trackVisit(linkId, req, date) {
    const userAgentData = getUserAgentData(req.headers['user-agent']);
    knex('visits').insert({
        date,
        link: linkId,
        ...userAgentData,
        referrer: req.headers['referrer'],
        utm_source: req.query['utm_source'],
        utm_medium: req.query['utm_medium'],
        utm_campaign: req.query['utm_campaign'],
    })
}

async function createLink(id, target, name) {
    const rs = await knex('links')
        .returning(linkColumns)
        .insert({
            target,
            name,
            id: id || generateRandomId(5),
            created_at: new Date(),
            updated_at: new Date()
        }, linkColumns);
    return rs[0];
}

async function updateLink(id, target, name) {
    const rs = await knex('links')
        .where('id', id)
        .update({
            target,
            name,
            updated_at: new Date()
        }, linkColumns);
    return rs[0]
}

async function getVisitsOfLink(id) {
    return knex('visits').where('link', id)
}

async function getTotalVisits(id) {
    const rs = await knex('visits').count('id').where('link', id);
    return rs[0].count;
}

module.exports = {
    getAllLinks,
    getLinkById,
    trackVisit,
    createLink,
    updateLink,
    getVisitsOfLink,
    getTotalVisits
};