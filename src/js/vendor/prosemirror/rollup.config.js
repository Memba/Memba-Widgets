/* eslint-disable global-require */
module.exports = {
    input: './src/js/vendor/prosemirror/library.js',
    output: [
        {
            file: './src/js/vendor/prosemirror/prosemirror.mjs',
            format: 'es', //  'cjs',
            // sourcemap: true,
        },
    ],
    plugins: [
        require('@rollup/plugin-node-resolve').nodeResolve({
            main: true,
            preferBuiltins: false,
        }),
        require('@rollup/plugin-json')(),
        require('@rollup/plugin-commonjs')(),
        require('@rollup/plugin-buble')({
            transforms: { dangerousForOf: true }, // For prosemirror-markdown
        }),
    ],
    // external(id) { return !/^[\.\/]/.test(id) }
};
