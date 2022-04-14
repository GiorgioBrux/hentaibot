FROM node:16

WORKDIR /usr/hentaibot

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "node", "." ]
