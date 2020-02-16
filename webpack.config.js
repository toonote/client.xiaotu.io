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
        'main': './client/main.ts',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: process.env.NODE_ENV !== 'production' ? '[name].[hash].js':'[name].[contenthash].js',
        publicPath: '/',
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
                    name: '[name].[ext]?[contenthash]',
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
        new webpack.DefinePlugin({
            'TOONOTE_VERSION': '"' + require(path.join(__dirname, './package.json')).version + '"', 
        }),
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            favicon: path.join(__dirname, './client/favicon.ico'),
            template: path.join(__dirname, './client/index.html'),
            filename: path.join(__dirname, './dist/index.html'),
            chunks: [],
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackPlugin({
            favicon: path.join(__dirname, './client/favicon.ico'),
            template: path.join(__dirname, './client/login.html'),
            filename: path.join(__dirname, './dist/login.html'),
            chunks: ['login'],
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackPlugin({
            favicon: path.join(__dirname, './client/favicon.ico'),
            template: path.join(__dirname, './client/main.html'),
            filename: path.join(__dirname, './dist/main.html'),
            chunks: ['main'],
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin(),
    ]
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = 'none';
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
