FROM node:18
WORKDIR /app
COPY . .
RUN npm install
ENV API_KEY=mysecret
CMD ["node", "server.js"]
