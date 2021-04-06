const { tf } = window;

// Tensors
// ------------------
const shape = [4, 2];
// const data = tf.tensor([[4, 6], [5, 9], [13, 25], [1, 57]]);
const data = tf.tensor([4, 6, 5, 9, 13, 25, 1, 57], shape);
data.print();

// Variables
// ------------------
const data2 = tf.variable(tf.zeros([8]));
data2.print();

data2.assign(tf.tensor1d([4, 12, 5, 6, 56, 3, 45, 3]));
data2.print();

// Operations
// ------------------
const a = tf.tensor1d([1, 2, 3, 4]);
const b = tf.tensor1d([10, 20, 30, 40]);
a.add(b).print(); // or tf.add(a, b)

// Models
// ------------------
function simpleAdd(input1, input2) {
    // tidy is used to free up GPU memory once teh function returns
    return tf.tidy(() => {
        const x1 = input1;
        const x2 = input2;
        const y = x1.add(x2);
        return y;
    });
}

const c = tf.tensor1d([1, 2, 3, 4]);
const d = tf.tensor1d([10, 20, 30, 40]);
const result = simpleAdd(c, d);
result.print();

// Layers (sequential model)
// ------------------
const model = tf.sequential();
model.add(
    tf.layers.simpleRNN({
        // only needed on the first layer
        inputShape: [20, 4],
        // number of units or neurons
        units: 20,
        // weight
        recurrentInitializer: 'GlorotNormal',
    })
);
