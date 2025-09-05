// Form validation and enhancement
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('predictionForm');
    
    if (form) {
        // Add real-time validation
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                validateInput(this);
            });
            
            input.addEventListener('blur', function() {
                validateInput(this);
            });
        });
        
        // Form submission validation
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showError('Please correct the highlighted fields before submitting.');
            } else {
                // Show loading state
                const submitBtn = form.querySelector('.predict-btn');
                submitBtn.innerHTML = '<span>🔄 Predicting...</span>';
                submitBtn.disabled = true;
            }
        });
    }
    
    // Add smooth animations
    addAnimations();
});

function validateInput(input) {
    const value = parseFloat(input.value);
    const name = input.name;
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    input.classList.remove('error');
    removeErrorMessage(input);
    
    // Check if value is a number
    if (isNaN(value) && input.value !== '') {
        isValid = false;
        errorMessage = 'Please enter a valid number';
    }
    // Check specific field validations
    else if (input.value !== '') {
        switch (name) {
            case 'hours_study':
                if (value < 0 || value > 50) {
                    isValid = false;
                    errorMessage = 'Study hours must be between 0 and 50';
                }
                break;
            case 'attendance':
                if (value < 0 || value > 100) {
                    isValid = false;
                    errorMessage = 'Attendance must be between 0 and 100%';
                }
                break;
            case 'previous_score':
                if (value < 0 || value > 100) {
                    isValid = false;
                    errorMessage = 'Previous score must be between 0 and 100';
                }
                break;
        }
    }
    
    if (!isValid) {
        input.classList.add('error');
        showFieldError(input, errorMessage);
    }
    
    return isValid;
}

function showFieldError(input, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ff6b6b;
        font-size: 0.85rem;
        margin-top: 5px;
        padding: 5px 0;
        animation: fadeIn 0.3s ease;
    `;
    
    input.parentNode.appendChild(errorElement);
}

function removeErrorMessage(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span>${message}</span>
    `;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(245, 101, 101, 0.95);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(245, 101, 101, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 300);
    }, 5000);
}

function addAnimations() {
    // Add entrance animations
    const animatedElements = document.querySelectorAll('.form-container, .info-container, .result-card');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Add hover effects to form inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'translateY(0)';
        });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .error {
        border-color: rgba(245, 101, 101, 0.6) !important;
        background: rgba(245, 101, 101, 0.1) !important;
        box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1) !important;
    }
    
    .form-group {
        transition: transform 0.3s ease;
    }
    
    .prediction-badge {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// Add number formatting for better UX
document.addEventListener('DOMContentLoaded', function() {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove any non-numeric characters except decimal point
            let value = this.value.replace(/[^0-9.]/g, '');
            
            // Ensure only one decimal point
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            this.value = value;
        });
    });
});