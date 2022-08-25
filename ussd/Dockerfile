FROM node:carbon as build

WORKDIR /app

COPY *.json .

COPY . ./

RUN yarn install

RUN yarn build


# # for running the app
FROM node:carbon as run

WORKDIR /app

COPY *.json ./

RUN yarn install --production

COPY --from=build /app/dist .


EXPOSE 5000

CMD [ "node",  "index.js" ]