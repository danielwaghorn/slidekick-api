#!/usr/bin/env bash

function cleanup {
	docker stop slidekick-mongodb
}

mkdir -p data/
trap cleanup EXIT
[ ! "$(docker ps -a | grep slidekick-mongodb)" ] && docker run -d -p 27017:27017 -v data:/data/db --name slidekick-mongodb -e AUTH=no tutum/mongodb
docker start slidekick-mongodb & node ./bin/www
