const knex = require('./db');
const express = require('express');
const {ApolloServer, gql} = require('apollo-server-express');
const {
    GraphQLDateTime
} = require('graphql-iso-date');
const uaParser = require('ua-parser-js');

const alphabet = '123456789abcdefghkmnpqrstuvwxyz'.split('');
const randomId = length => {
    let id = '';
    for (let i = 0; i < length; i++) {
        const letter = alphabet[Math.round((alphabet.length - 1) * Math.random())];
        id = id + letter;
    }
    return id;
};

(async () => {
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

    const typeDefs = gql`
        scalar DateTime
        
        type Link {
            id: ID!
            target: String!
            name: String
            updated_at: DateTime
            created_at: DateTime!
            visits: [Visit!]
        }
        type Visit {
            date: DateTime!
            link: Link!
            browserName: String
            browserVersion: String
            deviceType: String
            deviceVendor: String
            deviceModel: String
            engineName: String
            engineVersion: String
            osName: String
            osVersion: String
            architecture: String
            referrer: String
            utm_source: String
            utm_medium: String
            utm_campaign: String
        }

        type Query {
            links: [Link]
            link(id: ID!): Link
        }

        type Mutation {
            createLink(target: String!, id: ID, name: String): Link
            updateLink(id: ID!, target: String, name: String): Link
        }
    `;

    const linkFields = ['id', 'target', 'name', 'updated_at', 'created_at'];

    const resolvers = {
        Query: {
            links: () => knex.select(['id', 'target', 'name', 'updated_at', 'created_at']).from('links'),
            link: (_, {id}) => knex('links')
                .first(linkFields)
                .where('id', id),
        },
        Mutation: {
            createLink: async (_, {id, ...data}) => {
                const rs = await knex('links')
                    .returning(linkFields)
                    .insert({
                        ...data,
                        id: id || randomId(5),
                        created_at: new Date(),
                        updated_at: new Date()
                    }, linkFields);
                return rs[0];
            },
            updateLink: async (_, {id, target, name}) => {
                const rs = await knex('links')
                    .where('id', id)
                    .update({
                        target, name,
                        updated_at: new Date()
                    }, linkFields);
                console.log({rs});
                return rs[0]
            }
        },
        Link: {
            visits: async (link) => {
                const rs = await knex('visits').where('link', link.id);
                return rs;
            }
        },
        DateTime: GraphQLDateTime
    };

    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    const app = express();
    await server.applyMiddleware({app});
    app.use((req, res, next) => {
        const date = new Date();
        knex('links').first(['id', 'target']).where('id', req.path.substr(1))
            .then(link => {
                if (link) {
                    res.redirect(link.target);
                    const ua = uaParser(req.headers['user-agent']);
                    knex('visits').insert({
                        date,
                        link: link.id,
                        browserName: ua.browser.name,
                        browserVersion: ua.browser.name,
                        deviceType: ua.device.type,
                        deviceVendor: ua.device.vendor,
                        deviceModel: ua.device.model,
                        engineName: ua.engine.name,
                        engineVersion: ua.engine.version,
                        osName: ua.os.name,
                        osVersion: ua.os.version,
                        architecture: ua.cpu.architecture,
                        referrer: req.headers['referrer'],
                        utm_source: req.query['utm_source'],
                        utm_medium: req.query['utm_medium'],
                        utm_campaign: req.query['utm_campaign'],
                    }).catch(console.log)
                } else next()
            })
    });

    app.listen(process.env.PORT || 80, server => console.log(server));
})();