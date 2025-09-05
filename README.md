# Student Performance Predictor

A comprehensive web-based application that predicts student academic performance using machine learning algorithms and provides interactive data visualizations.

## Features

### 🔮 ML Prediction Engine
- **Logistic Regression Model**: Custom JavaScript implementation
- **Real-time Predictions**: Instant Pass/Fail classification
- **Confidence Scoring**: Probability-based confidence levels
- **Model Accuracy**: Live accuracy metrics display

### 📊 Interactive Dashboard
- **Performance Distribution**: Pass vs Fail pie chart visualization
- **Attendance Analysis**: Performance correlation with attendance rates
- **Study Hours Impact**: Analysis of study time vs academic success
- **Feature Importance**: Visual ranking of predictive factors
- **Scatter Plot Analysis**: Multi-dimensional data exploration

### 🎨 Modern Design
- **Glassmorphism UI**: Frosted glass aesthetic with blur effects
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Smooth Animations**: Engaging micro-interactions and transitions
- **Gradient Backgrounds**: Beautiful color schemes and visual hierarchy

## Dataset Structure

The application uses a CSV dataset with the following columns:
- `hours_study`: Weekly study hours (0-50)
- `attendance`: Class attendance percentage (0-100%)
- `previous_score`: Last exam score (0-100)
- `result`: Academic outcome (1=Pass, 0=Fail)

## Technology Stack

- **Backend**: Node.js with Express framework
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Machine Learning**: Custom logistic regression implementation
- **Visualizations**: Chart.js for interactive charts
- **Styling**: Modern CSS with glassmorphism effects

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Application**:
   ```bash
   npm start
   ```

3. **Access the Application**:
   Open your browser to `http://localhost:3000`

## Usage Guide

### Making Predictions
1. Navigate to the **Predictor** tab
2. Enter student information:
   - Study hours per week (0-50)
   - Attendance percentage (0-100%)
   - Previous exam score (0-100)
3. Click "Predict Performance"
4. View results with confidence scores and model accuracy

### Viewing Analytics
1. Switch to the **Dashboard** tab
2. Explore interactive visualizations:
   - Pass/Fail distribution analysis
   - Attendance vs performance correlation
   - Study hours impact assessment
   - Feature importance rankings
   - Comprehensive scatter plot analysis

## Model Performance

The logistic regression model is trained on the provided dataset with:
- **Training Split**: 80% training, 20% testing
- **Algorithm**: Gradient descent optimization
- **Features**: Study hours, attendance, previous scores
- **Output**: Binary classification (Pass/Fail) with probability scores

## Project Structure

```
student-performance-predictor/
├── public/
│   ├── index.html          # Main application interface
│   ├── style.css           # Glassmorphism styling
│   └── script.js           # Client-side functionality
├── dataset.csv             # Student performance data
├── server.js               # Express server with ML model
├── package.json            # Project dependencies
└── README.md              # Project documentation
```

## API Endpoints

- `GET /` - Main application interface
- `POST /predict` - Student performance prediction
- `GET /dashboard-data` - Analytics dashboard data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.