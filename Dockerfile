FROM node:20-alpine

WORKDIR /app

# Копируем файлы package
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходники
COPY . .

# Собираем TypeScript
RUN npm run build

# Создаем директорию для БД
RUN mkdir -p /app/data

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
