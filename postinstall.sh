#!/usr/bin/env bash
if [ "$HOSTNAME" != dw-vps-1 ]; then
  export MONGODB_PASS=password
  echo "MongoDB Password is '$MONGODB_PASS'"
  docker pull tutum/mongodb
fi
