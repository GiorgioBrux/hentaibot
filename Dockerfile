FROM node:18

WORKDIR /usr/hentaibot

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "node", "." ]
