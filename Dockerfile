FROM mhart/alpine-node:10.15.3

# Release version
ENV APP_VERSION=0.1.0

# Install packages
RUN apk --update add \
  git

# Copy package.json to temp folder
COPY package*.json /tmp/

# Install node dependencies
RUN cd /tmp && npm ci

# Set working directory and copy source
WORKDIR /usr/src
COPY . /usr/src

# Move compiled node modules back
RUN mv /tmp/node_modules node_modules

# Copy source code
COPY . .
