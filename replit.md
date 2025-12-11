# HR Survey - Система опросов

## Обзор
Веб-сервис для создания и проведения онлайн-опросов, ориентированный на нужды HR-отдела компании. Проект включает админ-панель для создания опросов, публичные страницы для прохождения и систему анализа результатов.

## Архитектура

### Backend (Symfony 7)
- **Расположение**: `/backend`
- **Фреймворк**: Symfony 7 с Doctrine ORM
- **База данных**: PostgreSQL
- **API**: RESTful API

#### Структура сущностей:
- `Survey` - опросы (название, описание, статус)
- `Question` - вопросы (текст, тип, варианты ответов)
- `Response` - ответы респондентов
- `Answer` - конкретные ответы на вопросы

#### Типы вопросов:
- `text` - текстовый ответ
- `single_choice` - выбор одного варианта
- `multiple_choice` - множественный выбор
- `rating` - шкала оценки 1-10

### Frontend (React + TypeScript)
- **Расположение**: `/frontend`
- **Сборка**: Vite
- **Графики**: Recharts
- **Маршрутизация**: React Router

#### Страницы:
- `/admin` - список опросов
- `/admin/surveys/new` - создание опроса
- `/admin/surveys/:id/edit` - редактирование опроса
- `/admin/surveys/:id/results` - результаты опроса
- `/survey/:id` - публичная страница прохождения опроса
- `/thank-you` - страница благодарности

## API Endpoints

### Опросы
- `GET /api/surveys` - список всех опросов
- `GET /api/surveys/active` - активные опросы
- `GET /api/surveys/:id` - детали опроса с вопросами
- `POST /api/surveys` - создание опроса
- `PUT /api/surveys/:id` - обновление опроса
- `DELETE /api/surveys/:id` - удаление опроса
- `POST /api/surveys/:id/toggle` - переключение статуса

### Ответы
- `POST /api/surveys/:id/submit` - отправка ответов
- `GET /api/surveys/:id/responses` - список ответов
- `GET /api/surveys/:id/statistics` - статистика по опросу

## Запуск

Проект запускается через `bash start.sh`:
- Backend: PHP built-in server на порту 8000
- Frontend: Vite dev server на порту 5000

## Технологии
- PHP 8.2
- Symfony 7.1
- Doctrine ORM
- Node.js 20
- React 18
- TypeScript
- Vite
- Recharts
- PostgreSQL

## Последние изменения
- 2025-12-11: Создан полный MVP проекта
  - Symfony backend с RESTful API
  - React frontend с админ-панелью
  - Система создания опросов с 4 типами вопросов
  - Публичная страница прохождения опросов
  - Визуализация результатов (графики)
