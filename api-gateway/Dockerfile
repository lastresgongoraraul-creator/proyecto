FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add our custom config
COPY nginx.conf /etc/nginx/conf.d/

# Add script to set the resolver dynamically
COPY 99-set-resolver.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/99-set-resolver.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
