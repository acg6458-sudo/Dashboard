# Dashboard Network Device Monitor

A network device monitoring system with frontend and backend architecture.

## Project Structure

```
test_wiki_page/
├── dashboard-server/     # Backend (Node.js + Express)
├── dashboard-client/     # Frontend (React + Vite)
├── Start.bat          # Start project script
├── SafePause.bat          # Safe stop script
├── Restart.bat          # Restart script
├── Init.bat        # Environment initialization script
└── README.md             # This file
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Web UI) | **4005** | http://localhost:4005 |
| Backend (API Server) | **4006** | http://localhost:4006 |
| API Endpoint | 4006 | http://localhost:4006/api |

## Quick Start

### Option 1: Use Batch Scripts

1. **Start the project**: Double-click `Start.bat`
2. **Stop the project**: Double-click `SafePause.bat`
3. **Restart the project**: Double-click `Restart.bat`
4. **Initialize environment**: Double-click `Init.bat`

### Option 2: Manual Start

**Start Backend:**
```bash
cd dashboard-server
node server.js
```

**Start Frontend:**
```bash
cd dashboard-client
npm run dev
```

## Default Login Credentials

- Username: `admin`
- Password: `admin123`

## Requirements

- Node.js >= 16.x
- MySQL 5.7+ (for database)
- npm >= 8.x

## Environment Variables

The following environment variables can be configured:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| PORT | 4006 | Backend server port |
| DB_HOST | localhost | Database host |
| DB_PORT | 3306 | Database port |
| DB_NAME | dashboard_db | Database name |
| DB_USER | root | Database username |
| JWT_SECRET | dashboard-secret-key-2024 | JWT token secret |

## Notes

- If ports 4005 or 4006 are already in use, the scripts will automatically attempt to stop the existing processes
- The frontend proxies API requests to the backend, so you only need to access the frontend URL
- Close the terminal windows to stop the services
