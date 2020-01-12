# Headless URL shortener
![Docker Pulls](https://img.shields.io/docker/pulls/mbrandau/url-shortener)
![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/mbrandau/url-shortener)

I couldn’t find an URL shortener that suited my needs, so I made one myself.
It’s build with Node.js, GraphQL and PostgreSQL.

## Features
 - GraphQL API
 - No UI
 - Configurable authorization
 - Statistics
 
## Doesn’t suit your needs?

Issues and PRs welcome!

## Configuration

Default configuration:
```json
{
  "access": {
    "create": ["public"],
    "read": ["public"],
    "update": [],
    "delete": []
  },
  "ids": {
    "alphabet": "123456789abcdefghkmnpqrstuvwxyz",
    "caseSensitive": false,
    "preserveDeleted": true,
    "generatorBlacklist": [],
    "generatorBlacklistRegex": "ad",
    "generalBlacklist": [""]
  }
}
```

## Deployment

This URL shortener uses PostgreSQL as a database.
You can set the connection string via the `POSTGRES` environment variable.
The port can be configured via the `PORT` environment variable. (defaults to `80`)
For a deployment using Docker see [Deploying with Docker Compose](https://github.com/mbrandau/url-shortener/wiki/Deploying-with-Docker-Compose).
