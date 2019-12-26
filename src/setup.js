const knex = require('./db');

module.exports = {
    async setupDatabase() {
        await knex.schema.createTable('links', table => {
            table.string('id', 40).notNullable().primary();
            table.string('target', 150);
            table.string('name', 50);
            table.timestamps(false, false);
        }).catch(console.log);
        await knex.schema.createTable('visits', table => {
            table.increments();
            table.dateTime('date').defaultTo(knex.fn.now());
            table.string('link', 40).references('id').inTable('links');

            table.string('browserName', 50);
            table.string('browserVersion', 50);

            table.string('deviceType', 50);
            table.string('deviceVendor', 50);
            table.string('deviceModel', 50);

            table.string('engineName', 50);
            table.string('engineVersion', 50);

            table.string('osName', 50);
            table.string('osVersion', 50);

            table.string('architecture', 50);

            table.string('referrer', 100);
            table.string('utm_source', 100);
            table.string('utm_medium', 100);
            table.string('utm_campaign', 100);
        }).catch(console.log);
    }
};
