FROM node:16-slim

RUN apt-get update && apt-get install --no-install-recommends -y ca-certificates git vim make curl \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY package-lock.json .

COPY . .

RUN make install-deps

CMD make run
