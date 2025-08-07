#!/bin/sh

echo "📦 [CI] Running pod install..."

# 필요한 경우 brew 설치테스트
if ! command -v pod &> /dev/null; then
  echo "🔧 Installing CocoaPods..."
  brew install cocoapods
fi

cd ios || exit 1
rm -rf Pods
rm -rf Podfile.lock
pod install --repo-update

echo "✅ [CI] pod install finished!"
