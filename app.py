from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import os

app = Flask(__name__)

# Global variables to store model and accuracy
model = None
model_accuracy = None
feature_names = None

def load_model():
    """Load the trained model from pickle file"""
    global model, model_accuracy, feature_names
    
    model_path = 'model/student_model.pkl'
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Please run train_model.py first.")
    
    try:
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        model = model_data['model']
        model_accuracy = model_data['accuracy']
        feature_names = model_data['feature_names']
        
        print(f"Model loaded successfully!")
        print(f"Model accuracy: {model_accuracy*100:.2f}%")
        
    except Exception as e:
        raise Exception(f"Error loading model: {str(e)}")

@app.route('/')
def home():
    """Home page with input form"""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests"""
    try:
        # Get form data
        hours_study = float(request.form['hours_study'])
        attendance = float(request.form['attendance'])
        previous_score = float(request.form['previous_score'])
        
        # Validate input ranges
        if not (0 <= hours_study <= 50):
            raise ValueError("Study hours must be between 0 and 50")
        if not (0 <= attendance <= 100):
            raise ValueError("Attendance must be between 0 and 100")
        if not (0 <= previous_score <= 100):
            raise ValueError("Previous score must be between 0 and 100")
        
        # Prepare input for prediction
        input_features = np.array([[hours_study, attendance, previous_score]])
        
        # Make prediction
        prediction = model.predict(input_features)[0]
        prediction_proba = model.predict_proba(input_features)[0]
        
        # Get probability for the predicted class
        if prediction == 1:  # Pass
            confidence = prediction_proba[1] * 100
            result_text = "Pass"
            result_class = "pass"
        else:  # Fail
            confidence = prediction_proba[0] * 100
            result_text = "Fail"
            result_class = "fail"
        
        # Prepare result data
        result_data = {
            'prediction': result_text,
            'confidence': round(confidence, 1),
            'probability_pass': round(prediction_proba[1] * 100, 1),
            'probability_fail': round(prediction_proba[0] * 100, 1),
            'model_accuracy': round(model_accuracy * 100, 1),
            'input_data': {
                'hours_study': hours_study,
                'attendance': attendance,
                'previous_score': previous_score
            },
            'result_class': result_class
        }
        
        return render_template('result.html', **result_data)
        
    except ValueError as e:
        return render_template('index.html', error=str(e))
    except Exception as e:
        return render_template('index.html', error=f"Prediction error: {str(e)}")

@app.route('/api/predict', methods=['POST'])
def api_predict():
    """API endpoint for predictions (JSON response)"""
    try:
        data = request.get_json()
        
        hours_study = float(data['hours_study'])
        attendance = float(data['attendance'])
        previous_score = float(data['previous_score'])
        
        # Validate input ranges
        if not (0 <= hours_study <= 50):
            return jsonify({'error': 'Study hours must be between 0 and 50'}), 400
        if not (0 <= attendance <= 100):
            return jsonify({'error': 'Attendance must be between 0 and 100'}), 400
        if not (0 <= previous_score <= 100):
            return jsonify({'error': 'Previous score must be between 0 and 100'}), 400
        
        # Prepare input for prediction
        input_features = np.array([[hours_study, attendance, previous_score]])
        
        # Make prediction
        prediction = model.predict(input_features)[0]
        prediction_proba = model.predict_proba(input_features)[0]
        
        # Prepare response
        response = {
            'prediction': 'Pass' if prediction == 1 else 'Fail',
            'probability_pass': round(prediction_proba[1], 3),
            'probability_fail': round(prediction_proba[0], 3),
            'confidence': round(max(prediction_proba) * 100, 1),
            'model_accuracy': round(model_accuracy * 100, 1),
            'input_features': {
                'hours_study': hours_study,
                'attendance': attendance,
                'previous_score': previous_score
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model-info')
def model_info():
    """Display model information"""
    if model is None:
        return "Model not loaded. Please run train_model.py first."
    
    info = {
        'model_type': type(model).__name__,
        'accuracy': f"{model_accuracy*100:.2f}%",
        'features': feature_names,
        'coefficients': model.coef_[0].tolist() if hasattr(model, 'coef_') else None
    }
    
    return jsonify(info)

if __name__ == '__main__':
    try:
        # Load the trained model
        load_model()
        
        print("="*50)
        print("STUDENT PERFORMANCE PREDICTOR")
        print("="*50)
        print(f"Model Accuracy: {model_accuracy*100:.2f}%")
        print("Server starting...")
        print("Access the application at: http://localhost:5000")
        print("="*50)
        
        # Run the Flask app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        print(f"Error starting application: {str(e)}")
        print("\nPlease make sure to:")
        print("1. Run 'python train_model.py' first to train the model")
        print("2. Install required packages: pip install flask scikit-learn pandas numpy")