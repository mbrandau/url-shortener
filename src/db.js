module.exports = require('knex')({
    client: 'pg',
    connection: process.env.POSTGRES || 'postgresql://root:root@localhost/urlshortener',
    useNullAsDefault: true
});