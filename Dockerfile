FROM mongo-express

MAINTAINER zhouyg zhou.y.g.890@email.com

WORKDIR  /

RUN mkdir /nodejs-www

COPY . /nodejs-www/simgle-mongo-server

WORKDIR /nodejs-www/simgle-mongo-server

ENV PORT "8880"
ENV DB_NAME "sms"
ENV MONGO_SERVER "mongo"

EXPOSE 8880

CMD ["sh", "docker-cmd.sh"]
