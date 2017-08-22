FROM node:8.3.0

WORKDIR /app

COPY package.json .

RUN yarn install
COPY . .

ENV DATABASE_URL /data/data.db
ENV SESSION_PATH /data/sessions.db

EXPOSE 3000

VOLUME ["/data"]

CMD ["yarn", "start"]