#!/bin/sh
RESOLVER=$(awk '/^nameserver/ {print $2; exit}' /etc/resolv.conf)
echo "Setting DNS resolver to $RESOLVER"
sed -i "s/RESOLVER_IP/$RESOLVER/g" /etc/nginx/conf.d/nginx.conf
