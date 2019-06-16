FROM node:12.3.1

WORKDIR /app

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN npm install

COPY src/ src/
COPY tests/ tests/

CMD ["npm", "run", "start"]