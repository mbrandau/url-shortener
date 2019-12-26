const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const {setupDatabase} = require('./setup');
const {typeDefs, resolvers} = require('./schema');
const {getLinkById, trackVisit} = require("./model");

(async () => {
    await setupDatabase();

    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    const app = express();
    await server.applyMiddleware({app});

    app.use(async (req, res, next) => {
        const date = new Date();
        const id = req.path.substr(1);
        const link = await getLinkById(id);
        if (link) {
            res.redirect(link.target);
            trackVisit(link.id, req, date);
        } else {
            next()
        }
    });

    app.listen(process.env.PORT || 80, () => console.log('Listening.'));
})();