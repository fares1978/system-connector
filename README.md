# FastAPI + React + MongoDB Docker Setup

A full-stack application with FastAPI backend, React frontend, and MongoDB database running in Docker containers.

## Project Structure

```
.
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── App.css
        ├── index.js
        └── index.css
```

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone or download this project

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs
   - **MongoDB**: localhost:27017

## Default Credentials

**MongoDB:**
- Username: `admin`
- Password: `password123`
- Database: `appdb`

⚠️ **Change these credentials before deploying to production!**

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /items` - Get all items
- `POST /items` - Create new item
- `GET /items/{item_id}` - Get specific item
- `PUT /items/{item_id}` - Update item
- `DELETE /items/{item_id}` - Delete item

## Features

- ✅ FastAPI backend with async MongoDB support
- ✅ React frontend with CRUD operations
- ✅ Docker containerization
- ✅ Hot reload for development
- ✅ CORS configured
- ✅ Data persistence with Docker volumes

## Development

The setup includes hot reload for both frontend and backend:

- **Backend**: Changes to Python files will trigger automatic reload
- **Frontend**: Changes to React files will trigger automatic reload

## Stopping the Application

```bash
docker-compose down
```

To remove volumes (delete all data):
```bash
docker-compose down -v
```

## Customization

### Change MongoDB Credentials

Edit `docker-compose.yml`:
```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: your_username
  MONGO_INITDB_ROOT_PASSWORD: your_password
```

### Change Ports

Edit the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:CONTAINER_PORT"
```

## Production Deployment

For production:
1. Change MongoDB credentials
2. Use environment variables for sensitive data
3. Build optimized frontend: change CMD to `npm run build` and serve with nginx
4. Remove `--reload` flag from uvicorn
5. Add proper logging and monitoring
6. Use Docker secrets for credentials
