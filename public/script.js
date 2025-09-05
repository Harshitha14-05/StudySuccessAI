// Global variables
let charts = {};
let dashboardData = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadDashboardData();
});

// Initialize event listeners
function initializeEventListeners() {
    const form = document.getElementById('predictionForm');
    if (form) {
        form.addEventListener('submit', handlePrediction);
    }
}

// Show/hide sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load dashboard if switching to dashboard
    if (sectionId === 'dashboard' && !dashboardData) {
        loadDashboardData();
    } else if (sectionId === 'dashboard' && dashboardData) {
        initializeCharts();
    }
}

// Handle prediction form submission
async function handlePrediction(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.predict-btn');
    const resultContainer = document.getElementById('resultContainer');
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Prediction failed');
        }
        
        const result = await response.json();
        displayPredictionResult(result);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to make prediction. Please try again.');
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Validate form inputs
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = parseFloat(input.value);
        input.classList.remove('error');
        
        if (isNaN(value) || value < 0) {
            input.classList.add('error');
            isValid = false;
        }
        
        // Specific validations
        if (input.name === 'attendance' && (value < 0 || value > 100)) {
            input.classList.add('error');
            isValid = false;
        }
        
        if (input.name === 'previous_score' && (value < 0 || value > 100)) {
            input.classList.add('error');
            isValid = false;
        }
        
        if (input.name === 'hours_study' && value > 50) {
            input.classList.add('error');
            isValid = false;
        }
    });
    
    if (!isValid) {
        showError('Please check your input values. Make sure they are within valid ranges.');
    }
    
    return isValid;
}

// Display prediction result
function displayPredictionResult(result) {
    const predictionBadge = document.getElementById('predictionBadge');
    const predictionText = document.getElementById('predictionText');
    const confidenceValue = document.getElementById('confidenceValue');
    const accuracyValue = document.getElementById('accuracyValue');
    const probabilityValue = document.getElementById('probabilityValue');
    
    // Update prediction text and styling
    predictionText.textContent = result.prediction;
    predictionBadge.className = `prediction-badge ${result.prediction.toLowerCase()}`;
    
    // Update values
    confidenceValue.textContent = `${result.confidence}%`;
    accuracyValue.textContent = `${result.accuracy}%`;
    probabilityValue.textContent = result.probability;
    
    // Show result container with animation
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.style.opacity = '0';
    resultContainer.style.display = 'block';
    
    setTimeout(() => {
        resultContainer.style.transition = 'opacity 0.5s ease';
        resultContainer.style.opacity = '1';
    }, 100);
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/dashboard-data');
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        dashboardData = await response.json();
        initializeCharts();
        updateStats();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Initialize all charts
function initializeCharts() {
    if (!dashboardData) return;
    
    initializePassFailChart();
    initializeAttendanceChart();
    initializeStudyHoursChart();
    initializeFeatureChart();
    initializeScatterChart();
}

// Initialize pass/fail distribution chart
function initializePassFailChart() {
    const ctx = document.getElementById('passFailChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (charts.passFail) {
        charts.passFail.destroy();
    }
    
    const data = dashboardData.passFailDistribution;
    
    charts.passFail = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pass', 'Fail'],
            datasets: [{
                data: [data.pass, data.fail],
                backgroundColor: [
                    'rgba(72, 187, 120, 0.8)',
                    'rgba(245, 101, 101, 0.8)'
                ],
                borderColor: [
                    'rgba(72, 187, 120, 1)',
                    'rgba(245, 101, 101, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Initialize attendance performance chart
function initializeAttendanceChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;
    
    if (charts.attendance) {
        charts.attendance.destroy();
    }
    
    const data = dashboardData.attendancePerformance;
    
    charts.attendance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.range),
            datasets: [{
                label: 'Pass',
                data: data.map(item => item.pass),
                backgroundColor: 'rgba(72, 187, 120, 0.8)',
                borderColor: 'rgba(72, 187, 120, 1)',
                borderWidth: 1
            }, {
                label: 'Fail',
                data: data.map(item => item.fail),
                backgroundColor: 'rgba(245, 101, 101, 0.8)',
                borderColor: 'rgba(245, 101, 101, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Initialize study hours performance chart
function initializeStudyHoursChart() {
    const ctx = document.getElementById('studyHoursChart');
    if (!ctx) return;
    
    if (charts.studyHours) {
        charts.studyHours.destroy();
    }
    
    const data = dashboardData.studyHoursPerformance;
    
    charts.studyHours = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.range),
            datasets: [{
                label: 'Pass',
                data: data.map(item => item.pass),
                backgroundColor: 'rgba(72, 187, 120, 0.8)',
                borderColor: 'rgba(72, 187, 120, 1)',
                borderWidth: 1
            }, {
                label: 'Fail',
                data: data.map(item => item.fail),
                backgroundColor: 'rgba(245, 101, 101, 0.8)',
                borderColor: 'rgba(245, 101, 101, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Initialize feature importance chart
function initializeFeatureChart() {
    const ctx = document.getElementById('featureChart');
    if (!ctx) return;
    
    if (charts.feature) {
        charts.feature.destroy();
    }
    
    const data = dashboardData.featureImportance;
    
    charts.feature = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.feature),
            datasets: [{
                label: 'Importance',
                data: data.map(item => parseFloat(item.importance)),
                backgroundColor: [
                    'rgba(255, 107, 107, 0.8)',
                    'rgba(254, 202, 87, 0.8)',
                    'rgba(72, 187, 120, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 107, 107, 1)',
                    'rgba(254, 202, 87, 1)',
                    'rgba(72, 187, 120, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Initialize scatter plot
function initializeScatterChart() {
    const ctx = document.getElementById('scatterChart');
    if (!ctx) return;
    
    if (charts.scatter) {
        charts.scatter.destroy();
    }
    
    const data = dashboardData.scatterData;
    const passData = data.filter(item => item.result === 1);
    const failData = data.filter(item => item.result === 0);
    
    charts.scatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Pass',
                data: passData.map(item => ({
                    x: item.hours_study,
                    y: item.previous_score
                })),
                backgroundColor: 'rgba(72, 187, 120, 0.8)',
                borderColor: 'rgba(72, 187, 120, 1)',
                borderWidth: 2
            }, {
                label: 'Fail',
                data: failData.map(item => ({
                    x: item.hours_study,
                    y: item.previous_score
                })),
                backgroundColor: 'rgba(245, 101, 101, 0.8)',
                borderColor: 'rgba(245, 101, 101, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Study Hours per Week',
                        color: '#fff'
                    },
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Previous Score',
                        color: '#fff'
                    },
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Update dashboard statistics
function updateStats() {
    if (!dashboardData) return;
    
    const totalStudents = dashboardData.passFailDistribution.pass + 
                         dashboardData.passFailDistribution.fail;
    const passRate = ((dashboardData.passFailDistribution.pass / totalStudents) * 100).toFixed(1);
    
    document.getElementById('dashboardAccuracy').textContent = `${dashboardData.modelAccuracy}%`;
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('passRate').textContent = `${passRate}%`;
}

// Show error message
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(245, 101, 101, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 16px rgba(245, 101, 101, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 5000);
}

// Add CSS for error notifications
const style = document.createElement('style');
style.textContent = `
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
        border-color: rgba(245, 101, 101, 0.5) !important;
        background: rgba(245, 101, 101, 0.1) !important;
    }
`;
document.head.appendChild(style);