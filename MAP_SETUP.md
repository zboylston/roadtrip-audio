# Google Maps Setup Guide

## Issue
The map is showing "Oops! Something went wrong" because the Google Maps API key is either missing, invalid, or has usage restrictions.

## Solution

### 1. Create a .env file
Create a `.env` file in the root directory of your project with the following content:

```
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCn6zNZob64SMurO2n0qEcM2B8hn7cmLWM

# Google Maps Configuration
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here

# Google Cloud Configuration (for server-side scripts only)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
```

### 2. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. Restrict the API key (recommended):
   - Click on the API key you just created
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your domain or use "localhost" for development
   - Under "API restrictions", select "Restrict key" and choose "Maps JavaScript API"

### 3. Update the .env file
Replace `your_actual_google_maps_api_key_here` with your actual API key.

### 4. Restart the development server
After creating the `.env` file, restart your Expo development server:

```bash
npm start
# or
expo start
```

## Alternative Solutions

If you don't want to use Google Maps, you can:

1. **Use a different map provider** like Mapbox, OpenStreetMap, or Apple Maps
2. **Disable the map feature** by commenting out the map toggle button
3. **Use a static map image** instead of an interactive map

## Current Improvements Made

The map implementation has been improved with:
- Better error handling and user-friendly error messages
- Fallback error display when the API fails to load
- WebView error handling for network issues
- Graceful degradation when the map is unavailable

The app will now show a proper error message instead of "Oops! Something went wrong" when the map fails to load. 