# Custom Approach Notification Audio Setup

## 🎵 **How to Add Your Custom Audio File**

### Step 1: Prepare Your Audio File
1. **Format**: Use MP3, WAV, or M4A format
2. **Duration**: Keep it short (5-10 seconds) for a good user experience
3. **Quality**: Use a clear, attention-grabbing sound
4. **Volume**: Make sure it's loud enough to hear in a car

### Step 2: Upload the File
1. **Copy your audio file** to the `assets/audio/` folder
2. **Rename it** to `approach-notification.mp3` (or update the code to match your filename)
3. **Make sure the file is in the correct location**: `assets/audio/approach-notification.mp3`

### Step 3: Test the Audio
1. **Start the development server**: `npx expo start -c`
2. **Open the app** in Expo Go
3. **Tap the volume icon** (🔊) in the header to test the approach sound
4. **You should hear your custom audio file**

## 🔧 **What the Code Does**

### When a User Approaches a Waypoint:
1. **Detects** when user is within 2 miles of a waypoint
2. **Plays** your custom audio file instead of TTS
3. **Shows** a notification on the device
4. **Displays** the "Near" badge in the app

### Fallback Behavior:
- If the audio file fails to load, it falls back to TTS
- If TTS fails, it just shows the notification

## 🎯 **Customization Options**

### Change the Audio File:
```javascript
// In app/(tabs)/index.tsx, line ~530
const { sound } = await Audio.Sound.createAsync(
  require('../../assets/audio/your-custom-file.mp3'), // Change this line
  { shouldPlay: true, volume: 1.0 }
);
```

### Adjust the Volume:
```javascript
// Change volume from 0.0 to 1.0
{ shouldPlay: true, volume: 0.8 } // 80% volume
```

### Change the Trigger Distance:
```javascript
// In the approach detection code, line ~375
if (dist < 3218 && dist > 1609) { // 2 miles = 3218 meters
  // Change 3218 to your preferred distance in meters
}
```

## 🚀 **Testing**

### Test Without Driving:
- Tap the **volume icon** (🔊) in the header
- This plays your approach notification sound immediately

### Test While Driving:
- Start a trip (tap the play button)
- Drive near a waypoint
- You should hear your custom audio when within 2 miles

## 📱 **Supported Audio Formats**
- **MP3** (recommended)
- **WAV**
- **M4A**
- **AAC**

## 🎵 **Audio File Recommendations**
- **Short and clear** (5-10 seconds)
- **Attention-grabbing** but not jarring
- **Professional quality** (not too quiet or distorted)
- **Appropriate for driving** (won't startle the driver)

## 🔧 **Troubleshooting**

### Audio Not Playing:
1. Check the file path is correct
2. Verify the file format is supported
3. Make sure the file isn't corrupted
4. Check console logs for errors

### Audio Too Quiet/Loud:
1. Adjust the volume in the code (0.0 to 1.0)
2. Re-encode the audio file with better levels
3. Test on different devices

### File Not Found Error:
1. Make sure the file is in `assets/audio/`
2. Check the filename matches exactly
3. Restart the development server after adding the file 