FROM node:18.9.0-alpine as build

WORKDIR /app

COPY *.json ./

COPY . .

RUN yarn install

RUN yarn build


# # for running the app
FROM node:18.9.0-alpine as run

WORKDIR /app

COPY *.json ./

RUN yarn install --production

COPY --from=build /app/dist .


EXPOSE 5000

CMD [ "node",  "index.js" ]