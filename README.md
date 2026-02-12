# TravelLens 🌍✈️

An AI-powered travel trip logging and analytics platform that helps you track, analyze, and get insights from your travel experiences. Think of it as "Spotify Wrapped" but for your travel adventures!

## 🌟 Features

### Core Functionality
- **Trip Management**: Create, edit, and delete trips with detailed information
- **Place Logging**: Track places visited with ratings and notes
- **Hotel Management**: Log accommodation details with automatic cost calculations
- **Expense Tracking**: Monitor spending across different categories with visual charts
- **Travel Analytics**: Get personalized insights about your travel patterns
- **Smart Recommendations**: AI-powered destination and activity suggestions

### Advanced Features
- **Travel Personality Detection**: Discover if you're a Budget Explorer, Smart Traveler, or Luxury Traveler
- **Spotify Wrapped-Style Insights**: Beautiful yearly travel summaries
- **Budget Optimization**: Get tips to optimize your travel spending
- **ML-Powered Recommendations**: Personalized suggestions based on your travel history
- **External API Integration**: Real-time destination and attraction data

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive design
- **Recharts** for beautiful data visualizations
- **Lucide React** for consistent iconography
- **React Router** for seamless navigation

### Backend
- **Flask** with Blueprint architecture
- **SQLAlchemy ORM** for database management
- **JWT Authentication** for secure user sessions
- **Flask-CORS** for cross-origin requests

### Database
- **MySQL** for relational data storage
- **Migrations** for schema management

### Analytics & ML
- **Pandas & NumPy** for data analysis
- **Scikit-learn** for machine learning models
- **KMeans Clustering** for user segmentation
- **Cosine Similarity** for recommendations

### External APIs
- **GeoDB Cities API** for destination data
- **OpenTripMap API** for attraction information
- **Caching system** for API optimization

## 📁 Project Structure

```
TravelLens/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable UI components
│   │   ├── charts/          # Chart components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Flask backend application
│   ├── routes/              # API route handlers
│   ├── models/              # Database models
│   ├── analytics/           # Data analysis engine
│   ├── ml/                  # Machine learning modules
│   ├── utils/               # Utility functions
│   ├── app.py               # Flask application factory
│   └── requirements.txt
├── database/                # Database related files
│   └── schema.sql           # Database schema
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MySQL 8.0+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TravelLens
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Database Setup
1. Create a MySQL database named `travellens`
2. Run the schema file:
```bash
mysql -u username -p travellens < database/schema.sql
```

#### Environment Configuration
1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
DATABASE_URL=mysql+pymysql://username:password@localhost/travellens
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
GEODB_API_KEY=your-geodb-api-key
OPENTRIPMAP_API_KEY=your-opentripmap-api-key
```

#### Start the Backend Server
```bash
flask run
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd frontend
npm install
```

#### Start the Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Trip Management
- `GET /api/trips` - Get all user trips
- `POST /api/trips` - Create a new trip
- `GET /api/trips/<id>` - Get specific trip
- `PUT /api/trips/<id>` - Update trip
- `DELETE /api/trips/<id>` - Delete trip

### Places Management
- `GET /api/places/<trip_id>` - Get places for a trip
- `POST /api/places` - Add a new place
- `PUT /api/places/<id>` - Update place
- `DELETE /api/places/<id>` - Delete place

### Hotels Management
- `GET /api/hotels/<trip_id>` - Get hotels for a trip
- `POST /api/hotels` - Add a new hotel
- `PUT /api/hotels/<id>` - Update hotel
- `DELETE /api/hotels/<id>` - Delete hotel

### Expenses Management
- `GET /api/expenses/<trip_id>` - Get expenses for a trip
- `GET /api/expenses/<trip_id>/summary` - Get expense summary
- `POST /api/expenses` - Add a new expense
- `PUT /api/expenses/<id>` - Update expense
- `DELETE /api/expenses/<id>` - Delete expense

### Analytics & Insights
- `GET /api/insights/<user_id>` - Get user travel insights
- `GET /api/recommendations/<user_id>` - Get personalized recommendations

## 🤖 Machine Learning Features

### User Segmentation
The system uses KMeans clustering to segment users into 5 travel personas:
1. **Budget Explorer** - Cost-conscious travelers
2. **Cultural Traveler** - Museum and heritage enthusiasts
3. **Adventure Seeker** - Outdoor and nature lovers
4. **Luxury Traveler** - Premium experience seekers
5. **Family Vacationer** - Family-oriented travelers

### Recommendation Engine
- **Destination Recommendations** based on travel history and preferences
- **Budget Optimization** using spending pattern analysis
- **Place Type Suggestions** matching user interests
- **Trip Success Prediction** for better planning

### Analytics Engine
- **Spending Pattern Analysis** with trend detection
- **Travel Frequency Analysis** with seasonal preferences
- **Destination Diversity Scoring**
- **Budget Utilization Tracking**

## 🎨 UI/UX Features

### Design System
- **Modern, Minimal Design** with soft shadows and rounded corners
- **Responsive Layout** that works on all devices
- **Consistent Color Palette** using Tailwind CSS
- **Smooth Animations** and micro-interactions

### Key Pages
1. **Dashboard** - Overview of travel statistics and recent trips
2. **Trip Logger** - Create and manage travel trips
3. **Places Logger** - Track visited places with ratings
4. **Hotel Logger** - Manage accommodation details
5. **Expense Tracker** - Monitor spending with charts
6. **Insights** - Spotify Wrapped-style travel summary
7. **Recommendations** - AI-powered travel suggestions

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - MySQL database connection string
- `SECRET_KEY` - Flask application secret key
- `JWT_SECRET_KEY` - JWT token secret key
- `GEODB_API_KEY` - GeoDB Cities API key (optional)
- `OPENTRIPMAP_API_KEY` - OpenTripMap API key (optional)

### Database Configuration
The application uses MySQL with the following main tables:
- `users` - User information and authentication
- `trips` - Trip details and metadata
- `places` - Places visited during trips
- `hotels` - Accommodation information
- `expenses` - Expense tracking

## 🚀 Deployment

### Backend Deployment (Heroku Example)
```bash
# Install Heroku CLI
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL=your-production-db-url
heroku config:set SECRET_KEY=your-production-secret

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance Optimization

### Caching Strategy
- **API Response Caching** - 24-hour cache for external API calls
- **Database Query Optimization** - Indexed columns and efficient joins
- **Frontend Optimization** - Lazy loading and code splitting

### Security Features
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **CORS Configuration** - Proper cross-origin resource sharing
- **Input Validation** - Server-side validation for all inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Flask Community** - For the excellent web framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Scikit-learn** - For the machine learning tools
- **OpenTripMap** - For providing open travel data

---

**Happy Traveling with TravelLens! 🌍✈️**
