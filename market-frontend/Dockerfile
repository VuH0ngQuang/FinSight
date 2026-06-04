FROM node:24-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_INGESTION_API_BASE_URL
ARG VITE_MQTT_BROKER_URL
ARG VITE_MQTT_TOPIC

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_INGESTION_API_BASE_URL=${VITE_INGESTION_API_BASE_URL}
ENV VITE_MQTT_BROKER_URL=${VITE_MQTT_BROKER_URL}
ENV VITE_MQTT_TOPIC=${VITE_MQTT_TOPIC}

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig*.json ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
