FROM node:18
RUN apt update && apt install -y apt-transport-https ca-certificates sqlite3
ARG WORK_DIR
WORKDIR ${WORK_DIR}
COPY . .
RUN npm install
