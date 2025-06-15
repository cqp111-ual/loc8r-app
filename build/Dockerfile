### Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy only necessary files
COPY loc8r-app/package*.json ./
COPY loc8r-app/angular.json ./
COPY loc8r-app/tsconfig*.json ./
COPY loc8r-app/ionic.config.json ./

# Install dependencies
RUN npm install -g @angular/cli @ionic/cli && npm install

# Copy rest of code
COPY loc8r-app/ .

# Build loc8r-app
RUN npm run build

### Serve app
FROM nginx:alpine

# Elimina el contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos del build al contenedor Nginx
COPY --from=build /app/www/ /usr/share/nginx/html/

# Copia configuración personalizada (opcional)
COPY build/nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

# Arranca Nginx
CMD ["nginx", "-g", "daemon off;"]