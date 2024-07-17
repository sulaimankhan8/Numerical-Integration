// Function to add input rows dynamically
function addInputRow() {
    const inputTable = document.getElementById('inputTable');

    const newRow = document.createElement('div');
    newRow.classList.add('input-row');
    newRow.innerHTML = `
        <label for="xInput">x:</label>
        <input type="number" class="x-input" step="any" required>
        <label for="fxInput">f(x):</label>
        <input type="number" class="fx-input" step="any" required>
        <button type="button" class="remove-row-button" onclick="removeInputRow(this)">-</button>
    `;

    inputTable.appendChild(newRow);
    addEnterKeyListener(newRow.querySelector('.x-input'));
    addEnterKeyListener(newRow.querySelector('.fx-input'));
}

// Function to remove input rows dynamically
function removeInputRow(button) {
    const rowToRemove = button.parentNode;
    rowToRemove.remove();
}

// Function to add Enter key listener to input fields
function addEnterKeyListener(input) {
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
            const currentIndex = inputs.indexOf(input);
            const nextInput = inputs[currentIndex + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    });
}

// Call this function for initial input rows if any
document.querySelectorAll('input[type="number"]').forEach(addEnterKeyListener);

// Function to calculate numerical integral
function calculateIntegral() {
    // Clear previous result and error messages
    document.getElementById('result').innerText = '';
    document.getElementById('error').innerText = '';
    document.getElementById('polynomial').innerText = '';

    const inputRows = document.querySelectorAll('.input-row');
    const n = inputRows.length;
    const rule = document.getElementById('ruleSelect').value;

    if (n < 2) {
        document.getElementById('error').innerText = 'Please add at least two points (x, f(x)) for integration.';
        return;
    }

    // Collect input values
    const xValues = [];
    const fxValues = [];

    inputRows.forEach(row => {
        const xInput = row.querySelector('.x-input');
        const fxInput = row.querySelector('.fx-input');

        // Ensure numeric values
        const xVal = parseFloat(xInput.value);
        const fxVal = parseFloat(fxInput.value);

        if (!isNaN(xVal) && !isNaN(fxVal)) {
            xValues.push(xVal);
            fxValues.push(fxVal);
        } else {
            document.getElementById('error').innerText = 'Invalid input: please enter numeric values for x and f(x).';
            return;
        }
    });

    // Ensure arrays are non-empty
    if (xValues.length !== n || fxValues.length !== n) {
        document.getElementById('error').innerText = 'Invalid input: please ensure all rows are filled with numeric values.';
        return;
    }

    // Prepare a function from discrete data points
    const f = (x) => {
        const index = xValues.findIndex(val => val === x);
        if (index !== -1) {
            return fxValues[index];
        } else {
            return NaN; // If x value not found (should not happen with valid input)
        }
    };

    // Integration limits
    const a = xValues[0];
    const b = xValues[n - 1];

    let result;
    try {
        switch (rule) {
            case 'trapezoidal':
                result = trapezoidalRule(f, a, b, n);
                break;
            case 'simpson13':
                result = simpson13Rule(f, a, b, n);
                break;
            case 'simpson38':
                result = simpson38Rule(f, a, b, n);
                break;
            case 'weddle':
                result = weddleRule(f, a, b, n);
                break;
            case 'boole':
                result = booleRule(f, a, b, n);
                break;
            default:
                document.getElementById('error').innerText = 'Invalid rule selected.';
                return;
        }
    } catch (error) {
        document.getElementById('error').innerText = 'Error in calculation: ' + error.message;
        return;
    }

    if (!isNaN(result)) {
        document.getElementById('result').innerText = `Approximate integral: ${result}`;
        displayPolynomial(xValues, fxValues);
    } else {
        document.getElementById('error').innerText = 'Calculation error: please check your input values and try again.';
    }
}

// Numerical integration methods
function trapezoidalRule(f, a, b, n) {
    const h = (b - a) / (n - 1);
    let sum = 0.5 * (f(a) + f(b));
    for (let i = 1; i < n - 1; i++) {
        sum += f(a + i * h);
    }
    return sum * h;
}

function simpson13Rule(f, a, b, n) {
    if (n % 2 === 0) n--; // Ensure n is odd for Simpson's 1/3 Rule
    const h = (b - a) / (n - 1);
    let sum = f(a) + f(b);
    for (let i = 1; i < n - 1; i += 2) {
        sum += 4 * f(a + i * h);
    }
    for (let i = 2; i < n - 1; i += 2) {
        sum += 2 * f(a + i * h);
    }
    return (h / 3) * sum;
}

function simpson38Rule(f, a, b, n) {
    if (n % 3 !== 0) n = Math.floor(n / 3) * 3 + 1; // Adjust n to be multiple of 3 + 1
    const h = (b - a) / (n - 1);
    let sum = f(a) + f(b);
    for (let i = 1; i < n - 1; i++) {
        if (i % 3 === 0) {
            sum += 2 * f(a + i * h);
        } else {
            sum += 3 * f(a + i * h);
        }
    }
    return (3 * h / 8) * sum;
}

function weddleRule(f, a, b, n) {
    if (n % 6 !== 0) n = Math.floor(n / 6) * 6 + 1; // Adjust n to be multiple of 6 + 1
    const h = (b - a) / (n - 1);
    let sum = f(a) + f(b);
    for (let i = 1; i < n - 1; i++) {
        if (i % 6 === 1 || i % 6 === 5) {
            sum += 5 * f(a + i * h);
        } else if (i % 6 === 2 || i % 6 === 4) {
            sum += f(a + i * h);
        } else {
            sum += 6 * f(a + i * h);
        }
    }
    return (3 * h / 10) * sum;
}

function booleRule(f, a, b, n) {
    if (n % 4 !== 0) n = Math.floor(n / 4) * 4 + 1; // Adjust n to be multiple of 4 + 1
    const h = (b - a) / (n - 1);
    let sum = 7 * (f(a) + f(b));
    for (let i = 1; i < n - 1; i++) {
        if (i % 4 === 0) {
            sum += 14 * f(a + i * h);
        } else if (i % 2 === 0) {
            sum += 12 * f(a + i * h);
        } else {
            sum += 32 * f(a + i * h);
        }
    }
    return (2 * h / 45) * sum;
}

// Function to display the polynomial
function displayPolynomial(xValues, fxValues) {
    const polynomial = lagrangePolynomial(xValues, fxValues);
    const polynomialString = polynomialToString(polynomial);
    document.getElementById('polynomial').innerText = `Polynomial: ${polynomialString}`;
}

// Function to generate Lagrange polynomial
function lagrangePolynomial(xValues, fxValues) {
    const n = xValues.length;
    const polynomial = [];

    for (let i = 0; i < n; i++) {
        const xi = xValues[i];
        const yi = fxValues[i];
        const term = [yi];

        for (let j = 0; j < n; j++) {
            if (j !== i) {
                const xj = xValues[j];
                term.push([-1 / (xi - xj), 1 / (xi - xj)]);
            }
        }

        polynomial.push(term);
    }

    return combineTerms(polynomial);
}

// Function to combine polynomial terms
function combineTerms(terms) {
    const result = {};

    terms.forEach(term => {
        let termPoly = { 0: 1 };
        term.forEach((factor, index) => {
            if (index === 0) {
                termPoly = multiplyPolynomials(termPoly, { 0: factor });
            } else {
                const [a, b] = factor;
                termPoly = multiplyPolynomials(termPoly, { 0: b, 1: a });
            }
        });
        Object.keys(termPoly).forEach(exp => {
            if (!result[exp]) result[exp] = 0;
            result[exp] += termPoly[exp];
        });
    });

    return result;
}

// Function to multiply polynomials
function multiplyPolynomials(poly1, poly2) {
    const result = {};

    Object.keys(poly1).forEach(exp1 => {
        Object.keys(poly2).forEach(exp2 => {
            const exp = parseInt(exp1) + parseInt(exp2);
            const coef = poly1[exp1] * poly2[exp2];
            if (!result[exp]) result[exp] = 0;
            result[exp] += coef;
        });
    });

    return result;
}

// Function to convert polynomial object to string
function polynomialToString(poly) {
    return Object.keys(poly).sort((a, b) => b - a).map(exp => {
        const coef = poly[exp];
        if (coef === 0) return null;
        const sign = coef > 0 ? ' + ' : ' - ';
        const absCoef = Math.abs(coef);
        return `${sign}${absCoef}${exp == 0 ? '' : exp == 1 ? 'x' : `x^${exp}`}`;
    }).filter(Boolean).join('').replace(/^\s\+\s/, '');
}

// Function to add initial listeners
document.querySelectorAll('input[type="number"]').forEach(addEnterKeyListener);

// Function to add a new input row
document.getElementById('addRowButton').addEventListener('click', addInputRow);

// Function to calculate the integral when the button is clicked
document.getElementById('calculateButton').addEventListener('click', calculateIntegral);
