FROM node:24
ENV NPM_CONFIG_LOGLEVEL notice

# OS setup
RUN apt update
RUN apt -y install neofetch

# Node/NPM setup
WORKDIR /app
COPY . .
RUN npm install

# Start app
CMD neofetch && npm run js
