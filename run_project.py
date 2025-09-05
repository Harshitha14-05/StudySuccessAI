#!/usr/bin/env python3
"""
Student Performance Predictor - Project Runner
This script helps you set up and run the complete project.
"""

import os
import sys
import subprocess
import pickle
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required!")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def install_requirements():
    """Install required packages"""
    print("\n📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install packages: {e}")
        return False

def check_dataset():
    """Check if dataset exists"""
    if os.path.exists('dataset.csv'):
        print("✅ Dataset found: dataset.csv")
        return True
    else:
        print("❌ Dataset not found: dataset.csv")
        return False

def train_model():
    """Train the machine learning model"""
    print("\n🤖 Training machine learning model...")
    try:
        subprocess.check_call([sys.executable, "train_model.py"])
        print("✅ Model trained successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Model training failed: {e}")
        return False

def check_model():
    """Check if trained model exists"""
    model_path = Path("model/student_model.pkl")
    if model_path.exists():
        print("✅ Trained model found!")
        
        # Load and display model info
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            accuracy = model_data['accuracy']
            print(f"   Model Accuracy: {accuracy*100:.2f}%")
        except Exception as e:
            print(f"   Warning: Could not read model details: {e}")
        
        return True
    else:
        print("❌ Trained model not found!")
        return False

def run_flask_app():
    """Run the Flask application"""
    print("\n🚀 Starting Flask application...")
    print("="*50)
    print("🎓 STUDENT PERFORMANCE PREDICTOR")
    print("="*50)
    print("📍 Application will be available at: http://localhost:5000")
    print("🔄 Press Ctrl+C to stop the server")
    print("="*50)
    
    try:
        subprocess.check_call([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n\n👋 Application stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Flask application failed: {e}")

def create_directories():
    """Create necessary directories"""
    directories = ['model', 'static', 'templates']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    print("✅ Project directories created")

def main():
    """Main function to run the complete setup"""
    print("🎓 Student Performance Predictor - Setup & Run")
    print("="*50)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Create directories
    create_directories()
    
    # Check dataset
    if not check_dataset():
        print("\n💡 Please make sure dataset.csv exists in the project directory")
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Check if model exists, if not train it
    if not check_model():
        if not train_model():
            return
    
    # Run Flask app
    run_flask_app()

if __name__ == "__main__":
    main()