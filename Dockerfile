FROM node:14
ENV NPM_CONFIG_LOGLEVEL info
ARG PORT

# OS setup
RUN apt update
RUN apt -y install neofetch

# Node/NPM setup
WORKDIR /app
COPY . .
RUN npm install -g npm@7
RUN npm install --save

# Misc
RUN neofetch

# Start app
CMD npm start
