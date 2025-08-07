#!/bin/sh

echo "🔧 Installing JS dependencies..."
npm install

echo "🔧 Installing CocoaPods..."
cd ios
pod install
