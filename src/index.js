const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const {setupDatabase} = require('./setup');
const {typeDefs, resolvers} = require('./schema');
const {getLinkById, trackVisit} = require("./model");

(async () => {
    await setupDatabase();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: (context => {
            const token = context.req.headers['authentication'];
            return {
                token
            }
        })
    });

    const app = express();
    await server.applyMiddleware({app});

    app.use(async (req, res, next) => {
        const date = new Date();
        const id = req.path.substr(1);
        if (id === '') next();
        else {
            const link = await getLinkById(id);
            if (link) {
                console.log(`${link.id} => ${link.target} from ${req.ip}`);
                res.redirect(link.target);
                trackVisit(link.id, req, date).catch(e => console.log(`Couldn‘t track visit for ${link.id}: ${e}`));
            } else {
                next()
            }
        }
    });
    app.use((req, res, next) => {
        next(new Error('Not found'))
    });
    app.use((err, req, res, next) => {
        res.send('Error: ' + err.message);
    });

    app.listen(process.env.PORT || 80, () => console.log('Listening.'));
})();