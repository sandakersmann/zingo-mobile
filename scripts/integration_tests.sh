#!/bin/bash

function emulator_launch() {
  emu_status=$(adb devices | grep "emulator-5554" | cut -f1)
  if [ "${emu_status}" = "emulator-5554" ]
  then
      return 0;
  else
      return 1;
  fi
}

function boot_complete() {
  boot_status=$(adb -s emulator-5554 shell getprop sys.boot_completed)
  if [ "${boot_status}" = "1" ]
  then
      return 0;
  else
      return 1;
  fi
}

function wait_for() {
  timeout=$1
  shift 1
  until [ $timeout -le 0 ] || ("$@" &> /dev/null)
  do
      sleep 1
      timeout=$(( timeout - 1 ))
  done
  if [ $timeout -le 0 ]
  then
      echo -e "\nFailed due to timeout"
      exit 1
  fi
}

# Setup working directory
if [ ! -d "./android/app" ];
then
    echo "Failed. Run './scripts/integration_tests.sh' from zingo-mobile root directory."
    exit 1
fi
cd android

# Create integration test report directory
rm -rf app/build/outputs/integration_test_reports
mkdir app/build/outputs/integration_test_reports

echo -e "\nBuilding APKs..."
./gradlew assembleDebug assembleAndroidtest

echo -e "\nDownloading system images..."
sdkmanager --install "system-images;android-30;default;x86_64"
sdkmanager --licenses

echo -e "Creating AVDs..."
avdmanager create avd --force --name pixel2_x86_64 --package "system-images;android-30;default;x86_64" --device pixel_2 --abi x86_64

echo -e "\nWaiting for emulator to launch..."
emulator -avd pixel2_x86_64 -netdelay none -netspeed full -no-window -no-audio -gpu swiftshader_indirect -read-only -no-boot-anim \
&> app/build/outputs/integration_test_reports/emulator.txt &
wait_for 600 emulator_launch
echo "$(adb devices | grep "emulator-5554" | cut -f1) launch successful"

echo -e "\nWaiting for AVD to boot..."
wait_for 600 boot_complete
echo $(adb -H localhost -P 5037 -s emulator-5554 emu avd name | head -1)
echo "Boot completed"
adb -H localhost -P 5037 -s emulator-5554 shell getprop &> app/build/outputs/integration_test_reports/getprop.txt

echo -e "\nInstalling APKs..."
adb -H localhost -P 5037 -s emulator-5554 install -r -t /home/oscar/src/zingo-mobile/android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb -H localhost -P 5037 -s emulator-5554 install -r -t /home/oscar/src/zingo-mobile/android/app/build/outputs/apk/debug/app-debug.apk

# Store emulator info and start logging
adb -H localhost -P 5037 -s emulator-5554 shell cat /proc/meminfo &> app/build/outputs/integration_test_reports/meminfo.txt
adb -H localhost -P 5037 -s emulator-5554 shell cat /proc/cpuinfo &> app/build/outputs/integration_test_reports/cpuinfo.txt
adb -H localhost -P 5037 -s emulator-5554 shell logcat -v threadtime -b main &> app/build/outputs/integration_test_reports/logcat.txt &

# Create additional test output directory
adb -H localhost -P 5037 -s emulator-5554 shell rm -rf "/sdcard/Android/media/org.ZingoLabs.Zingo/additional_test_output"
adb -H localhost -P 5037 -s emulator-5554 shell mkdir -p "/sdcard/Android/media/org.ZingoLabs.Zingo/additional_test_output"

echo -e "\nRunning integration tests..."
adb -H localhost -P 5037 -s emulator-5554 shell am instrument -w -r -e class org.ZingoLabs.Zingo.IntegrationTestSuite \
-e additionalTestOutputDir /sdcard/Android/media/org.ZingoLabs.Zingo/additional_test_output \
-e testTimeoutSeconds 31536000 org.ZingoLabs.Zingo.test/androidx.test.runner.AndroidJUnitRunner \
| tee app/build/outputs/integration_test_reports/test_results.txt

# Store additional test outputs
adb -H localhost -P 5037 -s emulator-5554 shell cat /sdcard/Android/media/org.ZingoLabs.Zingo/additional_test_output \
&> app/build/outputs/integration_test_reports/additional_test_output.txt

# Kill emulator
adb -s emulator-5554 emu kill

echo -e "\nTest reports saved in 'zingo-mobile/android/app/build/outputs/integration_test_reports' directory."
