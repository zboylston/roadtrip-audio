# Notification Audio Setup

## Overview
The app now supports custom audio notifications when approaching waypoints, with two different modes controlled by the settings.

## How It Works

### Alert Me Mode
When "Approach Behavior" is set to "Alert Me" in the settings:

1. **Approach Detection**: When you get within 2 miles of a waypoint, the app detects your approach
2. **Custom Audio Alert**: The app plays your custom `approach-notification.mp3` audio file
3. **Push Notification**: A push notification is sent to your device
4. **User Action**: You can either:
   - **Tap the notification** to open the app and start playing the waypoint's story audio
   - **Open the app manually** and tap the waypoint to start playing

### Auto-play Mode
When "Approach Behavior" is set to "Auto-play" in the settings:

1. **Approach Detection**: When you get within 5 miles of a waypoint, the app detects your approach
2. **Automatic Playback**: The waypoint's story audio starts playing automatically
3. **No Custom Alert**: The approach notification audio does not play

## Audio Files

### Approach Notification Audio
- **Location**: `assets/audio/approach-notification.mp3`
- **Purpose**: Plays when approaching waypoints in "Alert Me" mode
- **Format**: MP3, WAV, or M4A
- **Duration**: Recommended 2-5 seconds for a quick alert

### Waypoint Story Audio
- **Location**: Stored in Firebase or local audio files
- **Purpose**: The actual story content for each waypoint
- **Format**: MP3, WAV, or M4A
- **Duration**: Varies by waypoint content

## Settings Configuration

### Approach Behavior Toggle
- **Alert Me**: Plays custom audio alert + sends notification
- **Auto-play**: Automatically plays waypoint stories

### Additional Settings
- **Push Notifications**: Enable/disable push notifications
- **Sound**: Enable/disable all audio
- **Vibration**: Enable/disable vibration for notifications
- **Background Location**: Enable/disable background location tracking

## Testing

### Test Approach Sound
- Tap the volume icon (🔊) in the app header
- This plays your custom approach notification audio
- Useful for testing without approaching a waypoint

### Test Notifications
- Go to Settings → Testing → "Send Test Notification"
- This sends a test push notification
- Useful for testing notification permissions

## Troubleshooting

### Audio Not Playing
1. Check that your audio file is in `assets/audio/approach-notification.mp3`
2. Verify the file format is supported (MP3, WAV, M4A)
3. Check that "Sound" is enabled in settings
4. Restart the app with `npx expo start -c`

### Notifications Not Working
1. Check that "Push Notifications" is enabled in settings
2. Verify notification permissions are granted
3. Check device notification settings
4. Test with the "Send Test Notification" button

### Wrong Mode Behavior
1. Check the "Approach Behavior" setting in the app
2. Make sure you're in the correct mode for your preference
3. Restart the app to ensure settings are applied

## File Structure
```
assets/
  audio/
    approach-notification.mp3  # Your custom alert sound
```

## Code Changes Made

### Main Screen (`app/(tabs)/index.tsx`)
- Added settings context integration
- Modified approach notification logic to check notification mode
- Updated auto-play logic to respect notification mode
- Enhanced notification response handling

### Notification Service (`services/notificationService.js`)
- Added custom audio playback for approach notifications
- Enhanced notification scheduling with audio
- Improved notification response handling

### Settings Context (`contexts/SettingsContext.tsx`)
- Provides settings state management
- Handles notification mode preferences
- Persists settings in AsyncStorage

### Settings Screen (`app/(tabs)/settings.tsx`)
- Cleaned up UI by removing redundant "Auto-play Audio" toggle
- Renamed "Notification Mode" to "Approach Behavior" for clarity
- Changed "Notify" to "Alert Me" for better UX
- Simplified settings structure

### App Layout (`app/_layout.tsx`)
- Wrapped app with SettingsProvider
- Enables settings context throughout the app 