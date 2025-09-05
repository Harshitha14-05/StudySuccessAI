import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

def create_model_directory():
    """Create model directory if it doesn't exist"""
    if not os.path.exists('model'):
        os.makedirs('model')

def load_and_prepare_data():
    """Load and prepare the dataset"""
    print("Loading dataset...")
    df = pd.read_csv('dataset.csv')
    
    print(f"Dataset shape: {df.shape}")
    print(f"Dataset columns: {df.columns.tolist()}")
    print("\nDataset info:")
    print(df.info())
    print("\nFirst few rows:")
    print(df.head())
    
    # Separate features and target
    X = df[['hours_study', 'attendance', 'previous_score']]
    y = df['result']
    
    return X, y

def train_model(X, y):
    """Train the logistic regression model"""
    print("\nSplitting data into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Initialize and train the model
    print("\nTraining Logistic Regression model...")
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Training Complete!")
    print(f"Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Fail', 'Pass']))
    
    # Feature importance (coefficients)
    feature_names = ['hours_study', 'attendance', 'previous_score']
    coefficients = model.coef_[0]
    
    print("\nFeature Importance (Coefficients):")
    for feature, coef in zip(feature_names, coefficients):
        print(f"{feature}: {coef:.4f}")
    
    return model, accuracy

def save_model(model, accuracy):
    """Save the trained model and accuracy"""
    create_model_directory()
    
    model_data = {
        'model': model,
        'accuracy': accuracy,
        'feature_names': ['hours_study', 'attendance', 'previous_score']
    }
    
    model_path = 'model/student_model.pkl'
    
    print(f"\nSaving model to {model_path}...")
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    print("Model saved successfully!")

def main():
    """Main training pipeline"""
    try:
        # Load and prepare data
        X, y = load_and_prepare_data()
        
        # Train model
        model, accuracy = train_model(X, y)
        
        # Save model
        save_model(model, accuracy)
        
        print(f"\n{'='*50}")
        print("MODEL TRAINING COMPLETED SUCCESSFULLY!")
        print(f"Final Model Accuracy: {accuracy*100:.2f}%")
        print("Model saved to: model/student_model.pkl")
        print(f"{'='*50}")
        
    except FileNotFoundError:
        print("Error: dataset.csv file not found!")
        print("Please make sure the dataset.csv file exists in the current directory.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()