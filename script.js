/**
 * LUMPSUM INVESTMENT CALCULATOR
 * 
 * This script handles:
 * - Input validation and synchronization between number inputs and range sliders
 * - Calculation of investment returns using the compound interest formula
 * - Dynamic chart rendering with Chart.js
 * - Results display and animations
 * - Reset functionality
 */

// ===== DOM ELEMENTS =====
const investmentInput = document.getElementById('investmentAmount');
const investmentSlider = document.getElementById('investmentSlider');

const rateInput = document.getElementById('rateOfReturn');
const rateSlider = document.getElementById('rateSlider');
const rateDisplay = document.getElementById('rateDisplay');

const tenureInput = document.getElementById('tenure');
const tenureSlider = document.getElementById('tenureSlider');
const tenureDisplay = document.getElementById('tenureDisplay');

const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');

const resultsSection = document.getElementById('resultsSection');
const investedAmountEl = document.getElementById('investedAmount');
const estimatedReturnsEl = document.getElementById('estimatedReturns');
const totalValueEl = document.getElementById('totalValue');

// Chart instance variable (to destroy and recreate on recalculation)
let chartInstance = null;

// ===== INPUT SYNCHRONIZATION =====
/**
 * Synchronizes investment amount between number input and slider
 * Updates the slider's visual fill color
 */
function syncInvestmentInput(e) {
    const value = parseInt(e.target.value) || 0;
    
    if (e.target === investmentInput) {
        investmentSlider.value = value;
    } else {
        investmentInput.value = value;
    }
    
    // Update slider background gradient
    updateSliderBackground(investmentSlider);
}

/**
 * Synchronizes rate of return between number input and slider
 * Updates the rate display and slider's visual fill color
 */
function syncRateInput(e) {
    const value = parseFloat(e.target.value) || 0;
    
    if (e.target === rateInput) {
        rateSlider.value = value;
    } else {
        rateInput.value = value;
    }
    
    // Update rate display
    rateDisplay.textContent = value.toFixed(1) + '%';
    
    // Update slider background gradient
    updateSliderBackground(rateSlider);
}

/**
 * Synchronizes tenure between number input and slider
 * Enforces max value of 50 years
 * Updates the tenure display and slider's visual fill color
 */
function syncTenureInput(e) {
    let value = parseInt(e.target.value) || 0;
    
    // Enforce max value of 50
    if (value > 50) {
        value = 50;
    }
    
    if (e.target === tenureInput) {
        tenureSlider.value = value;
    } else {
        tenureInput.value = value;
    }
    
    // Update tenure display
    tenureDisplay.textContent = value + (value === 1 ? ' year' : ' years');
    
    // Update slider background gradient
    updateSliderBackground(tenureSlider);
}

/**
 * Updates the visual fill of a slider based on its current value
 * Creates a gradient effect showing the filled portion
 */
function updateSliderBackground(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const value = parseFloat(slider.value);
    
    // Calculate percentage
    const percentage = ((value - min) / (max - min)) * 100;
    
    // Set the CSS variable for gradient
    slider.style.setProperty('--slider-value', percentage + '%');
}

// ===== CALCULATION LOGIC =====
/**
 * Calculates investment returns using compound interest formula:
 * Future Value = Investment × (1 + R/100)^N
 * 
 * Returns object with:
 * - investedAmount: Initial investment
 * - futureValue: Total value after tenure
 * - estimatedReturns: Profit (Future Value - Invested Amount)
 */
function calculateReturns() {
    const investment = parseFloat(investmentInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const tenure = parseFloat(tenureInput.value) || 0;
    
    // Validate inputs
    if (investment <= 0 || rate < 0 || tenure <= 0) {
        alert('Please enter valid values for all fields');
        return null;
    }
    
    // Formula: FV = P × (1 + R/100)^N
    const futureValue = investment * Math.pow(1 + rate / 100, tenure);
    const estimatedReturns = futureValue - investment;
    
    return {
        investedAmount: investment,
        futureValue: futureValue,
        estimatedReturns: estimatedReturns
    };
}

// ===== FORMAT CURRENCY =====
/**
 * Formats a number as Indian currency (₹)
 * Examples: 100000 → ₹1,00,000 | 1000000 → ₹10,00,000
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ===== CHART INITIALIZATION =====
/**
 * Creates and renders a donut chart showing:
 * - Invested Amount (primary color)
 * - Estimated Returns (success color)
 * 
 * Destroys previous chart instance if it exists
 */
function renderChart(investedAmount, estimatedReturns) {
    const chartCanvas = document.getElementById('investmentChart');
    
    // Destroy existing chart instance
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Create new chart
    chartInstance = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Invested Amount', 'Estimated Returns'],
            datasets: [{
                data: [investedAmount, estimatedReturns],
                backgroundColor: [
                    '#5367ff',    // Primary indigo-blue
                    '#10b981'     // Success green
                ],
                borderColor: [
                    '#5367ff',
                    '#10b981'
                ],
                borderWidth: 3,
                borderRadius: 5,
                hoverBorderWidth: 4,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 14,
                            weight: '500'
                        },
                        color: '#6b7280',
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: "'Inter', sans-serif",
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif",
                        size: 13
                    },
                    borderColor: '#5367ff',
                    borderWidth: 1,
                    displayColors: true,
                    padding: 16,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return formatCurrency(value) + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// ===== DISPLAY RESULTS =====
/**
 * Displays calculation results on the page
 * Shows the results section with animation
 * Renders the investment breakdown chart
 */
function displayResults(results) {
    // Format currency values
    const formattedInvested = formatCurrency(results.investedAmount);
    const formattedReturns = formatCurrency(results.estimatedReturns);
    const formattedTotal = formatCurrency(results.futureValue);
    
    // Update DOM with results
    investedAmountEl.textContent = formattedInvested;
    estimatedReturnsEl.textContent = formattedReturns;
    totalValueEl.textContent = formattedTotal;
    
    // Show results section with animation
    resultsSection.style.display = 'grid';
    
    // Render chart
    renderChart(results.investedAmount, results.estimatedReturns);
}

// ===== EVENT HANDLERS =====
/**
 * Handles the Calculate button click
 * Validates inputs, calculates returns, and displays results
 */
calculateBtn.addEventListener('click', () => {
    const results = calculateReturns();
    
    if (results) {
        displayResults(results);
        
        // Scroll to results on mobile
        if (window.innerWidth < 768) {
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
});

/**
 * Handles the Reset button click
 * Clears all inputs, sliders, displays, and hides results section
 */
resetBtn.addEventListener('click', () => {
    // Reset input values
    investmentInput.value = 100000;
    rateInput.value = 10;
    tenureInput.value = 10;
    
    // Reset sliders
    investmentSlider.value = 100000;
    rateSlider.value = 10;
    tenureSlider.value = 10;
    
    // Update all displays
    updateSliderBackground(investmentSlider);
    updateSliderBackground(rateSlider);
    updateSliderBackground(tenureSlider);
    rateDisplay.textContent = '10%';
    tenureDisplay.textContent = '10 years';
    
    // Hide results section
    resultsSection.style.display = 'none';
    
    // Destroy chart
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
});

// ===== INPUT EVENT LISTENERS =====
// Investment amount synchronization
investmentInput.addEventListener('input', syncInvestmentInput);
investmentSlider.addEventListener('input', syncInvestmentInput);

// Rate of return synchronization
rateInput.addEventListener('input', syncRateInput);
rateSlider.addEventListener('input', syncRateInput);

// Tenure synchronization
tenureInput.addEventListener('input', syncTenureInput);
tenureSlider.addEventListener('input', syncTenureInput);

// ===== INITIALIZATION =====
/**
 * Initialize slider backgrounds on page load
 */
function initializeSliders() {
    updateSliderBackground(investmentSlider);
    updateSliderBackground(rateSlider);
    updateSliderBackground(tenureSlider);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSliders);
} else {
    initializeSliders();
}

// ===== KEYBOARD SUPPORT =====
/**
 * Allow Enter key to trigger calculation
 */
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.activeElement.classList.contains('input-field')) {
        calculateBtn.click();
    }
});
