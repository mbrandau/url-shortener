FROM node:13-alpine

WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN yarn

COPY . .
EXPOSE 80
ENV PORT=80
CMD ["node","src/index.js"]