FROM node:12.3.1

WORKDIR /app

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN npm install

COPY sample_data/ sample_data/
COPY src/ src/
COPY test/ test/

EXPOSE 9090

CMD ["npm", "run", "start"]