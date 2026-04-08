#!/bin/sh
envsubst '${API_BASE_ADDRESS}' < /usr/share/nginx/html/assets/config.template.json \
  > /usr/share/nginx/html/assets/config.json
exec nginx -g 'daemon off;'
