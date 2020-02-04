// @ts-nocheck
const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

module.exports = {
    mode: process.env.NODE_ENV === 'production'?'production':'development',
    watch: process.env.NODE_ENV !== 'production',
    entry: {
        'login': './client/login.ts',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[hash].js',
        publicPath: '/dist/',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    transpileOnly: true,
                    experimentalWatchApi: true,
                    appendTsSuffixTo: [/\.vue$/],
                }
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|eot|woff|ttf)$/,
                loader: 'url-loader',
                options: {
                    name: '[name].[ext]?[hash]',
                    limit: '10240',
                    esModule: false,
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    devServer: {
        port: 6224,
        inline: true,
        hot: true,
        contentBase: path.join(__dirname, 'dist'),
        // historyApiFallback: true,
        // noInfo: true
    },
    /* performance: {
        hints: false
    }, */
    devtool: '#eval-source-map',
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './client/login.html'),
            filename: path.join(__dirname, './dist/login.html'),
            chunks: ['login'],
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin(),
    ]
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        /* new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }) */
    ])
}
