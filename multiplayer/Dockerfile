# Usamos una imagen ligera de Node
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias (para cachear este paso)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de tu código
COPY . .

# Exponemos el puerto 5000 al mundo exterior
EXPOSE 5000

# El comando para arrancar tu servidor (el que usa tsx watch)
CMD ["npm", "run", "dev"]