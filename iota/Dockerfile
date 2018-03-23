## iota-ledger/iri Dockerfile

# FROM maven:3.5-jdk-8 as builder
# WORKDIR /iri
# COPY . /iri
# RUN mvn clean package

# FROM openjdk:jre-slim
# WORKDIR /iri
# COPY --from=builder /iri/target/iri-1.4.2.2.jar iri.jar
# COPY logback.xml /iri
# VOLUME /iri

# EXPOSE 14265
# EXPOSE 14777/udp
# EXPOSE 15777

# CMD ["/usr/bin/java", "-XX:+DisableAttachMechanism", "-Xmx8g", "-Xms256m", "-Dlogback.configurationFile=/iri/conf/logback.xml", "-Djava.net.preferIPv4Stack=true", "-jar", "iri.jar", "-p", "14265", "-u", "14777", "-t", "15777", "--remote", "--remote-limit-api", "\"addNeighbors, removeNeighbors, getNeighbors\"", "$@"]

## COO
# #clone tools repo
# cd ~ && mkdir tools && cd tools
# git clone https://github.com/automyr/private-iota-testnet
# cd private-iota-testnet
# #build tools jar
# mvn package
# #make the COO do 1 milestone
# cd target
# screen -dm java -jar iota-testnet-tools-0.1-SNAPSHOT-jar-with-dependencies.jar Coordinator localhost 14265

FROM maven:3.5-jdk-10

RUN mkdir iri
RUN mkdir node
COPY ./iri ./iri

WORKDIR iri
RUN mvn clean compile
RUN mvn package

RUN mv target/iri-1.4.2.2.jar ../node/iri-1.4.2.2.jar
WORKDIR ../node

EXPOSE 14265
EXPOSE 14777/udp
EXPOSE 15777

# TODO: Add neighbors.
CMD ["java", "-jar", "iri-1.4.2.2.jar", "-p", "14265", "-u", "14777", "-t", "15777", "--testnet", "--remote"]
