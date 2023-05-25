

function interpolateAndUpdate(a, b, fractionFactor) {
    // Perform linear interpolation between a and b
    var newValue = a + (b - a) * fractionFactor;

    // Update the value of a with the interpolated result
    a = newValue;

    // Display the updated value of a
    console.log(a);

    return a; // Return the updated value of a if needed
}

// Example usage:
var a = 50;
var b = 100;
var fractionFactor = 0.01;

// Perform interpolative updating 10 times

setInterval(() => {
    a = interpolateAndUpdate(a, b, fractionFactor);
    console.log(a);
}, 100);