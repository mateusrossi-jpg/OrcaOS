import React from 'react';
import { renderToString } from 'react-dom/server';
import { HomeScreen } from './src/app/screens/HomeScreen.js'; // This won't work because we need to transpile TSX

console.log("To render TSX we need a transpiler, I will use esbuild or ts-node if available.");
