const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Logistic Regression Implementation
class LogisticRegression {
  constructor() {
    this.weights = null;
    this.bias = 0;
    this.learningRate = 0.01;
    this.iterations = 1000;
    this.accuracy = 0;
  }

  sigmoid(z) {
    return 1 / (1 + Math.exp(-Math.max(-250, Math.min(250, z))));
  }

  normalize(data) {
    const features = ['hours_study', 'attendance', 'previous_score'];
    const normalized = data.map(row => ({ ...row }));
    
    features.forEach(feature => {
      const values = data.map(row => row[feature]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      
      normalized.forEach(row => {
        row[feature] = (row[feature] - min) / range;
      });
    });
    
    return normalized;
  }

  train(data) {
    const normalized = this.normalize(data);
    const m = normalized.length;
    
    // Initialize weights
    this.weights = [
      Math.random() * 0.01,
      Math.random() * 0.01,
      Math.random() * 0.01
    ];
    this.bias = Math.random() * 0.01;

    // Store normalization parameters
    this.normParams = {};
    const features = ['hours_study', 'attendance', 'previous_score'];
    features.forEach(feature => {
      const values = data.map(row => row[feature]);
      this.normParams[feature] = {
        min: Math.min(...values),
        max: Math.max(...values)
      };
    });

    // Gradient descent
    for (let i = 0; i < this.iterations; i++) {
      let predictions = [];
      let cost = 0;

      // Forward pass
      for (let j = 0; j < m; j++) {
        const row = normalized[j];
        const z = this.weights[0] * row.hours_study + 
                  this.weights[1] * row.attendance + 
                  this.weights[2] * row.previous_score + this.bias;
        const prediction = this.sigmoid(z);
        predictions.push(prediction);
        
        const y = row.result;
        cost += -(y * Math.log(prediction + 1e-15) + (1 - y) * Math.log(1 - prediction + 1e-15));
      }

      // Backward pass
      const dw = [0, 0, 0];
      let db = 0;

      for (let j = 0; j < m; j++) {
        const row = normalized[j];
        const error = predictions[j] - row.result;
        
        dw[0] += error * row.hours_study;
        dw[1] += error * row.attendance;
        dw[2] += error * row.previous_score;
        db += error;
      }

      // Update weights
      this.weights[0] -= this.learningRate * dw[0] / m;
      this.weights[1] -= this.learningRate * dw[1] / m;
      this.weights[2] -= this.learningRate * dw[2] / m;
      this.bias -= this.learningRate * db / m;
    }

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < m; i++) {
      const row = normalized[i];
      const prediction = this.predict([row.hours_study, row.attendance, row.previous_score], true);
      if ((prediction > 0.5 ? 1 : 0) === row.result) correct++;
    }
    this.accuracy = (correct / m * 100).toFixed(1);
  }

  predict(features, normalized = false) {
    let normalizedFeatures = features;
    
    if (!normalized) {
      normalizedFeatures = features.map((value, index) => {
        const featureNames = ['hours_study', 'attendance', 'previous_score'];
        const params = this.normParams[featureNames[index]];
        const range = params.max - params.min || 1;
        return (value - params.min) / range;
      });
    }

    const z = this.weights[0] * normalizedFeatures[0] + 
              this.weights[1] * normalizedFeatures[1] + 
              this.weights[2] * normalizedFeatures[2] + this.bias;
    
    return this.sigmoid(z);
  }
}

// Initialize model
let model = new LogisticRegression();
let dataset = [];

// Load and train model
function loadDataset() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream('dataset.csv')
      .pipe(csv())
      .on('data', (data) => {
        results.push({
          hours_study: parseFloat(data.hours_study),
          attendance: parseFloat(data.attendance),
          previous_score: parseFloat(data.previous_score),
          result: parseInt(data.result)
        });
      })
      .on('end', () => {
        dataset = results;
        model.train(dataset);
        console.log(`Model trained with accuracy: ${model.accuracy}%`);
        resolve();
      })
      .on('error', reject);
  });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/predict', (req, res) => {
  try {
    const { hours_study, attendance, previous_score } = req.body;
    
    const features = [
      parseFloat(hours_study),
      parseFloat(attendance),
      parseFloat(previous_score)
    ];
    
    const probability = model.predict(features);
    const prediction = probability > 0.5 ? 'Pass' : 'Fail';
    const confidence = (probability > 0.5 ? probability : 1 - probability) * 100;
    
    res.json({
      prediction,
      probability: probability.toFixed(3),
      confidence: confidence.toFixed(1),
      accuracy: model.accuracy,
      features: {
        hours_study: features[0],
        attendance: features[1],
        previous_score: features[2]
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Prediction failed' });
  }
});

app.get('/dashboard-data', (req, res) => {
  const passCount = dataset.filter(row => row.result === 1).length;
  const failCount = dataset.length - passCount;
  
  const attendanceRanges = {
    'Below 60%': dataset.filter(row => row.attendance < 60),
    '60-80%': dataset.filter(row => row.attendance >= 60 && row.attendance < 80),
    'Above 80%': dataset.filter(row => row.attendance >= 80)
  };
  
  const studyRanges = {
    'Below 10h': dataset.filter(row => row.hours_study < 10),
    '10-15h': dataset.filter(row => row.hours_study >= 10 && row.hours_study < 15),
    '15-20h': dataset.filter(row => row.hours_study >= 15 && row.hours_study < 20),
    'Above 20h': dataset.filter(row => row.hours_study >= 20)
  };
  
  res.json({
    passFailDistribution: {
      pass: passCount,
      fail: failCount
    },
    attendancePerformance: Object.keys(attendanceRanges).map(range => ({
      range,
      pass: attendanceRanges[range].filter(row => row.result === 1).length,
      fail: attendanceRanges[range].filter(row => row.result === 0).length
    })),
    studyHoursPerformance: Object.keys(studyRanges).map(range => ({
      range,
      pass: studyRanges[range].filter(row => row.result === 1).length,
      fail: studyRanges[range].filter(row => row.result === 0).length
    })),
    scatterData: dataset.map((row, index) => ({
      id: index + 1,
      hours_study: row.hours_study,
      attendance: row.attendance,
      previous_score: row.previous_score,
      result: row.result
    })),
    featureImportance: [
      { feature: 'Study Hours', importance: Math.abs(model.weights[0]).toFixed(3) },
      { feature: 'Attendance', importance: Math.abs(model.weights[1]).toFixed(3) },
      { feature: 'Previous Score', importance: Math.abs(model.weights[2]).toFixed(3) }
    ].sort((a, b) => b.importance - a.importance),
    modelAccuracy: model.accuracy
  });
});

// Start server
loadDataset().then(() => {
  app.listen(PORT, () => {
    console.log(`Student Performance Predictor running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to load dataset:', err);
});