const {createLink, getAllLinks, getLinkById, getVisitsOfLink, updateLink, deleteLink, getTotalVisits} = require('./model');
const {GraphQLDateTime} = require('graphql-iso-date');
const {gql} = require('apollo-server-express');
const {linkColumns} = require('./constants');
const {generateStatistics} = require('./statistics');
const {requireAuthorization} = require('./utils');
const moment = require('moment');

const typeDefs = gql`
    scalar DateTime

    type Link {
        id: ID!
        target: String!
        name: String
        updated_at: DateTime
        created_at: DateTime!
        visits: [Visit!]!
        totalVisits: Int!
        statistics(from: DateTime, to: DateTime): Statistics!
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

    type Statistics {
        from: DateTime!
        to: DateTime!
        totalVisits: Int!
        visits: [Visit!]!
        browsers: [Percentage!]!
        devices: [Percentage!]!
        referrers: [Percentage!]!
        utms: [Percentage!]!
        visitsPerDaytime: [Percentage!]!
        visitsPerWeekday: [Percentage!]!
    }

    type Percentage {
        property: String!
        percentage: Float
    }

    type Query {
        links: [Link!]!
        link(id: ID!): Link,
    }

    type Mutation {
        createLink(target: String!, id: ID, name: String): Link
        updateLink(id: ID!, target: String, name: String): Link
        deleteLink(id: ID!): Boolean!
    }
`;

const resolvers = {
    Query: {
        links: (root, args, ctx) => {
            requireAuthorization(ctx.token, 'read');
            return getAllLinks();
        },
        link: (root, {id}, ctx) => {
            requireAuthorization(ctx.token, 'read');
            return getLinkById(id);
        }
    },
    Mutation: {
        createLink: (_, {id, target, name}, ctx) => {
            requireAuthorization(ctx.token, 'create');
            return createLink(id, target, name);
        },
        updateLink: (_, {id, target, name}, ctx) => {
            requireAuthorization(ctx.token, 'update');
            return updateLink(id, target, name);
        },
        deleteLink: (_, {id}, ctx) => {
            requireAuthorization(ctx.token, 'delete');
            return deleteLink(id);
        }
    },
    Link: {
        visits: (link, _, ctx) => {
            requireAuthorization(ctx.token, 'read');
            return getVisitsOfLink(link.id);
        },
        totalVisits: (link, _, ctx) => {
            requireAuthorization(ctx.token, 'read');
            return getTotalVisits(link.id);
        },
        statistics: (link, {from, to}, ctx) => {
            requireAuthorization(ctx.token, 'read');
            return generateStatistics(link.id, from || link.created_at, to || new Date());
        }
    },
    DateTime: GraphQLDateTime
};

module.exports = {
    typeDefs,
    resolvers
};