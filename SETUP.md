# TravelLens Setup Guide 🌍

## Quick Start

### Option 1: Automatic Startup (Windows)
```bash
# Double-click this file or run in terminal
start.bat
```

### Option 2: Automatic Startup (Linux/Mac)
```bash
# Make executable and run
chmod +x start.sh
./start.sh
```

### Option 3: Manual Setup

## Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

## Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

5. **Setup database**
```bash
# Create MySQL database named 'travellens'
mysql -u root -p -e "CREATE DATABASE travellens;"

# Import schema
mysql -u root -p travellens < database/schema.sql
```

6. **Start Flask server**
```bash
flask run
```

## Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Copy environment file
cp .env.example .env
```

4. **Start React dev server**
```bash
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Default Test User

After setting up the database, you can login with:
- **Email**: john@example.com
- **Password**: password123

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Make sure MySQL is running
   - Check database credentials in .env file
   - Verify database name is 'travellens'

2. **Port Already in Use**
   - Change Flask port: `flask run --port 5001`
   - Change React port: `npm run dev -- --port 3000`

3. **Module Not Found**
   - Activate virtual environment
   - Run `pip install -r requirements.txt` again

4. **CORS Errors**
   - Make sure backend is running
   - Check Vite proxy configuration in vite.config.js

### Development Tips

1. **Database Migrations**
```bash
# Generate migration
flask db migrate -m "description"

# Apply migration
flask db upgrade
```

2. **Running Tests**
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

3. **Building for Production**
```bash
# Frontend build
cd frontend
npm run build

# Backend production deployment
cd backend
# Set FLASK_ENV=production
# Use WSGI server like Gunicorn
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=mysql+pymysql://username:password@localhost/travellens
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
GEODB_API_KEY=your-geodb-api-key
OPENTRIPMAP_API_KEY=your-opentripmap-api-key
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Keys (Optional)

For enhanced features, you can get free API keys:

1. **GeoDB Cities API**
   - Sign up at https://rapidapi.com/wirefreethought/api/geodb-cities
   - Get API key and add to .env

2. **OpenTripMap API**
   - Sign up at https://opentripmap.io/
   - Get API key and add to .env

## Features Overview

### Core Features
- ✅ User Authentication (JWT)
- ✅ Trip Management (CRUD)
- ✅ Place Logging with Ratings
- ✅ Hotel Management
- ✅ Expense Tracking with Charts
- ✅ Travel Analytics Dashboard
- ✅ Spotify Wrapped-Style Insights
- ✅ AI-Powered Recommendations

### Advanced Features
- ✅ Machine Learning User Segmentation
- ✅ Budget Optimization
- ✅ Travel Personality Detection
- ✅ External API Integration
- ✅ Responsive Design
- ✅ Real-time Data Updates

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure database is properly configured
4. Check environment variables are set correctly

For additional help, create an issue in the repository.

---

**Happy Traveling with TravelLens! 🌍✈️**
