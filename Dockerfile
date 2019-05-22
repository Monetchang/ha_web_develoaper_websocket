FROM daocloud.io/node
COPY . /app

WORKDIR /app
RUN npm install

EXPOSE 8088

CMD node main.js