"use strict";
import webpack from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',

  entry: './src/main.tsx',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@store': path.resolve(__dirname, 'src/store'),
    },
  },
  output: {
    filename: "bundle.js"
  },

  devtool: 'source-map',

  module: {
    rules: [
      { // typescript
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      { // javascript
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['react-refresh/babel'],
          }
        }
      },

      { // css
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },

      { // images
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        },
      },
    ]
  },

  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: false,
  },

  devServer: {
    static: {
      directory: path.join(__dirname, './dist')
    },
    compress: true,
    historyApiFallback: true,
    hot: true,
    host: "0.0.0.0",
    port: 25002,
    proxy: [
      {
        context: ['/api', '/admin', '/static'],
        target: 'http://127.0.0.1:23501',
        secure: false,
        changeOrigin: true,
      }
    ],
    devMiddleware: {
      writeToDisk: true,
    },
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        ignored: /node_modules/,
      },
    },
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '.' }
      ]
    })
  ],
};
