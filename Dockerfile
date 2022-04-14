FROM node:17

WORKDIR /usr/hentaibot

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "node", "." ]
