function calculate(a, b, callback) {
    let result = a + b;
    callback(result);
}

function display(result) {
    console.log("Sum is:", result);
}

calculate(10, 20, display);

