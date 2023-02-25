FROM node:18-alpine

# RUN apt-get -y update
# RUN apt-get -y install git
RUN apk add git
RUN npm install -g pnpm

# RUN mkdir -p /code/fun-bits && chown -R node:node /code/fun-bits

VOLUME /workspaces/fun-bits
WORKDIR /workspaces/fun-bits

# COPY pnpm-lock.yaml .
# RUN pnpm fetch

# RUN pnpm install