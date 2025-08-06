#!/bin/sh

# CocoaPods 설치
brew install cocoapods

# iOS 디렉토리로 이동해서 pod install
cd ios
pod install
