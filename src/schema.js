const {createLink, getAllLinks, getLinkById, getVisitsOfLink, updateLink, getTotalVisits} = require('./model');
const {GraphQLDateTime} = require('graphql-iso-date');
const {gql} = require('apollo-server-express');
const {linkColumns} = require('./constants');

const typeDefs = gql`
    scalar DateTime

    type Link {
        id: ID!
        target: String!
        name: String
        updated_at: DateTime
        created_at: DateTime!
        visits: [Visit!]
        totalVisitsCount: Int!
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

const resolvers = {
    Query: {
        links: getAllLinks,
        link: (_, {id}) => getLinkById(id),
    },
    Mutation: {
        createLink: (_, {id, target, name}) => createLink(id, target, name),
        updateLink: (_, {id, target, name}) => updateLink(id, target, name)
    },
    Link: {
        visits: link => getVisitsOfLink(link.id),
        totalVisitsCount: link => getTotalVisits(link.id)
    },
    DateTime: GraphQLDateTime
};

module.exports = {
    typeDefs,
    resolvers
};