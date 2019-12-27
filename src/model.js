const knex = require('./db');
const {generateRandomId, getUserAgentData, sanitizeId} = require('./utils');
const {linkColumns} = require('./constants');
const config = require('../config');

async function getAllLinks() {
    return knex('links')
        .select(linkColumns)
        .whereNull('deleted_at')
}

async function getLinkById(id) {
    id = sanitizeId(id);
    return knex('links')
        .first(linkColumns)
        .where('id', id)
        .whereNull('deleted_at')
}

async function trackVisit(linkId, req, date) {
    linkId = sanitizeId(linkId);
    const userAgentData = getUserAgentData(req.headers['user-agent']);
    return knex('visits').insert({
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
    id = sanitizeId(id);
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
    id = sanitizeId(id);
    const rs = await knex('links')
        .where('id', id)
        .whereNull('deleted_at')
        .update({
            target,
            name,
            updated_at: new Date()
        }, linkColumns);
    return rs[0]
}

async function deleteLink(id) {
    id = sanitizeId(id);
    await knex('visits').where('link', id).delete();
    if (config.preserveDeletedIds === true) {
        await knex('links')
            .where('id', id)
            .whereNull('deleted_at')
            .update({
                deleted_at: new Date()
            }, linkColumns);
    } else {
        await knex('links')
            .where('id', id)
            .delete();
    }
    return true
}

async function getVisitsOfLink(id) {
    id = sanitizeId(id);
    return knex('visits')
        .where('link', id)
        .whereNull('deleted_at');
}

async function getTotalVisits(id) {
    id = sanitizeId(id);
    const rs = await knex('visits')
        .count('id')
        .where('link', id);
    return rs[0].count;
}

async function getVisitsFromTo(id, from, to) {
    id = sanitizeId(id);
    return knex('visits')
        .where('link', id)
        .whereBetween('date', [from, to])
}

module.exports = {
    getAllLinks,
    getLinkById,
    trackVisit,
    createLink,
    updateLink,
    deleteLink,
    getVisitsOfLink,
    getTotalVisits,
    getVisitsFromTo
};