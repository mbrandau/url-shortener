const {createLink, getAllLinks, getLinkById, getVisitsOfLink, updateLink, getTotalVisits} = require('./model');
const {GraphQLDateTime} = require('graphql-iso-date');
const {gql} = require('apollo-server-express');
const {linkColumns} = require('./constants');
const {generateStatistics} = require('./statistics');
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
        statistics(from: DateTime!, to: DateTime): Statistics!
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
        links: [Link]
        link(id: ID!): Link,
        statistics(linkId: ID!, from: DateTime!, to: DateTime!): Statistics
    }

    type Mutation {
        createLink(target: String!, id: ID, name: String): Link
        updateLink(id: ID!, target: String, name: String): Link
    }
`;

const resolvers = {
    Query: {
        links: getAllLinks,
        link: (_, {id}) => getLinkById(id),
        statistics: (_, {linkId, from, to}) => generateStatistics(linkId, from, to)
    },
    Mutation: {
        createLink: (_, {id, target, name}) => createLink(id, target, name),
        updateLink: (_, {id, target, name}) => updateLink(id, target, name)
    },
    Link: {
        visits: link => getVisitsOfLink(link.id),
        totalVisits: link => getTotalVisits(link.id),
        statistics: (link,{from,to}) => generateStatistics(link.id, from, to ||new Date()),
    },
    DateTime: GraphQLDateTime
};

module.exports = {
    typeDefs,
    resolvers
};