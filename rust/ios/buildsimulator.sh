#!/bin/bash

cargo lipo --release --targets aarch64-apple-ios-sim
cbindgen src/lib.rs -l c > rust.h

cp ../target/aarch64-apple-ios-sim/release/librustios.a ../../ios
cp rust.h ../../ios/
