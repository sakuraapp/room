#!/bin/sh
/usr/src/app/scripts/audio.sh &
/init.sh &

node /usr/src/app/ "$@"