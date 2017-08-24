FROM node:8.3.0

WORKDIR /app

COPY package.json .

RUN yarn install
COPY . .

EXPOSE 3000

VOLUME ["/data"]

CMD ["yarn", "start"]