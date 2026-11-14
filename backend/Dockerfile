FROM node:22-alpine

ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY server.mjs ./server.mjs
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
