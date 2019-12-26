module.exports = require('knex')({
    client: 'pg',
    connection: process.env.POSTGRES,
    useNullAsDefault: true
});