FROM node:16
ENV NPM_CONFIG_LOGLEVEL notice
ARG PORT

# OS setup
RUN apt update
RUN apt -y install neofetch

# Node/NPM setup
WORKDIR /app
COPY . .
RUN npm install --save

# Start app
CMD neofetch && npm run js
