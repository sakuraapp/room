FROM jackson169/firefox:1.0
RUN apk add --update \
        nodejs \
        npm \
        pulseaudio \
        pulseaudio-utils \
        socat \
        alsa-utils

ENV VIDEO_BITRATE=1200000 \
    VIDEO_FPS=30 \
    VIDEO_CODEC="libx264" \
    AUDIO_BITRATE=44100 \
    AUDIO_ENABLED=0

#ENV STREAMING_URL="" \
#    STREAMING_TOKEN="" \
#    ROOM_ID=""

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD package.json /usr/src/app/
RUN npm i --production
ADD . /usr/src/app

ENTRYPOINT [ "/usr/src/app/scripts/start.sh" ]