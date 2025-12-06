# Dynamic Form Builder - Backend API

This is the Laravel backend API for the Dynamic Form Builder application.

## Features

-   **Role-Based Access Control**: Super Admin, Admin, and User roles
-   **Dynamic Screen Management**: Create/update/delete screens dynamically
-   **Dynamic Form Builder**: Create forms with various field types
-   **File Upload Support**: Images, audio files (mp3), PDFs
-   **API Authentication**: Laravel Sanctum

## Requirements

-   PHP >= 8.2
-   Composer
-   MySQL
-   Laravel 11.x

## Installation

1. **Install dependencies**:

```bash
cd backend
composer install
```

2. **Configure environment**:

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vibe_pattern
DB_USERNAME=root
DB_PASSWORD=
```

3. **Generate application key**:

```bash
php artisan key:generate
```

4. **Create storage link**:

```bash
php artisan storage:link
```

5. **Run migrations**:

```bash
php artisan migrate
```

6. **Seed the database** (optional):

```bash
php artisan db:seed --class=ScreenAndFormSeeder
```

This will create sample screens (Music, Vibro, Profile) and sample forms with various field types.

## API Endpoints

### Authentication

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| POST   | `/api/auth/login`  | Login user             |
| POST   | `/api/auth/logout` | Logout user            |
| GET    | `/api/auth/me`     | Get authenticated user |

### Super Admin Routes

**Screens:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/screens` | Get all screens |
| POST | `/api/screens` | Create new screen |
| GET | `/api/screens/{id}` | Get screen detail |
| PUT | `/api/screens/{id}` | Update screen |
| DELETE | `/api/screens/{id}` | Delete screen |

**Forms:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forms` | Get all forms (dashboard) |
| GET | `/api/screens/{screen_id}/forms` | Get forms by screen |
| POST | `/api/screens/{screen_id}/forms` | Create form for screen |
| GET | `/api/forms/{id}` | Get form detail |
| PUT | `/api/forms/{id}` | Update form |
| DELETE | `/api/forms/{id}` | Delete form |

### Admin Routes (Form Filling)

| Method | Endpoint                               | Description                  |
| ------ | -------------------------------------- | ---------------------------- |
| GET    | `/api/admin/screens`                   | Get all active screens       |
| GET    | `/api/admin/screens/{screen_id}/forms` | Get active forms for screen  |
| GET    | `/api/admin/forms/{id}`                | Get form schema              |
| POST   | `/api/admin/forms/{id}/submit`         | Submit form data (multipart) |

### User Routes (View Data)

| Method | Endpoint                         | Description                   |
| ------ | -------------------------------- | ----------------------------- |
| GET    | `/api/user/screens`              | Get active screens (for tabs) |
| GET    | `/api/user/screens/{slug}/forms` | Get forms by screen slug      |
| GET    | `/api/user/forms/{id}`           | Get form detail with values   |

## Default Users

After running seeders, you can login with:

-   Super Admin: `superadmin@example.com` / `password`
-   Admin: `admin@example.com` / `password`
-   User: `user@example.com` / `password`

## Development

**Start development server**:

```bash
php artisan serve
```

**Run migrations**:

```bash
php artisan migrate:fresh --seed
```

## License

MIT License
