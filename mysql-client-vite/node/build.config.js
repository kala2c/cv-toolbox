const path = require('node:path');
// const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    target: 'node-webkit',
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, '../public', 'node'),
        filename: 'bundle.js',
        clean: true,
    },
    module: {
        rules: []
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '..', 'src'),
        },
        extensions: ['.js']
    },
    plugins: [
        new CleanWebpackPlugin(),
        // new CopyPlugin({
        //     patterns: [
        //         {
        //             from: 'public',
        //             to: './',
        //             toType: 'dir',
        //         },
        //     ]
        // }),
    ]
};
