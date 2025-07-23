# 🗺️ Curious Road

**Discover the stories hidden along your journey**

Curious Road is an innovative location-based audio storytelling app that transforms your road trips into immersive adventures. As you travel, the app automatically detects nearby points of interest and delivers captivating audio stories about the history, culture, and hidden gems around you.

## ✨ Features

### 🎧 **Smart Audio Discovery**
- **Automatic Detection**: Get notified when approaching interesting locations
- **High-Quality Audio**: Listen to professionally narrated stories and historical accounts
- **Offline Support**: Download stories for offline listening during your journey

### 🗺️ **Interactive Map**
- **Real-time Location**: See your position and nearby waypoints on an interactive map
- **Distance Sorting**: Waypoints are automatically sorted by distance for easy discovery
- **Visual Markers**: Beautiful map markers show story locations with preview information

### 🔔 **Smart Notifications**
- **Proximity Alerts**: Get notified when approaching a story location
- **Configurable Modes**: Choose between notification alerts or automatic audio playback
- **Background Operation**: Works seamlessly in the background while you drive

### ⚙️ **Personalized Settings**
- **Customizable Experience**: Adjust notification preferences and audio settings
- **Location Controls**: Manage background location permissions
- **Audio Controls**: Pause, resume, and stop audio playback with ease

## 🎨 Design Philosophy

Curious Road features a beautiful, modern design inspired by the spirit of discovery and adventure:

- **Warm Color Palette**: Rich oranges and deep greens evoke the feeling of exploration
- **Clean Typography**: Easy-to-read fonts optimized for mobile viewing
- **Intuitive Navigation**: Simple, accessible interface that works while driving
- **Responsive Design**: Adapts to different screen sizes and orientations

## 🚀 Getting Started

### Prerequisites
- React Native / Expo development environment
- Android or iOS device for testing
- Google Maps API key for map functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/curious-road.git
   cd curious-road
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Set up a Firebase project
   - Add your Firebase configuration to `firebaseConfig.js`
   - Configure Firestore database for waypoint data

4. **Set up Google Maps API**
   - Get a Google Maps API key
   - Add the key to your environment variables

5. **Run the app**
   ```bash
   npx expo start
   ```

## 🏗️ Architecture

### Core Components
- **Waypoints Screen**: Main interface for discovering and playing stories
- **Settings Screen**: User preferences and app configuration
- **CuriousRoadLogo**: Reusable logo component with theming support
- **Audio Player**: Handles audio playback with pause/resume functionality

### Services
- **Firebase Service**: Manages waypoint data and user preferences
- **Notification Service**: Handles proximity alerts and push notifications
- **Location Service**: Tracks user location and manages geofencing

### State Management
- **React Context**: Global settings and user preferences
- **Local State**: Component-specific state management
- **AsyncStorage**: Persistent local data storage

## 🎯 Key Features in Detail

### Distance-Based Sorting
Waypoints are automatically sorted by distance from your current location, ensuring the most relevant stories appear first.

### Interactive Map Integration
The app includes a fully functional Google Maps integration with:
- Custom waypoint markers
- Real-time location tracking
- Interactive info windows
- Smooth animations and transitions

### Audio Playback System
Advanced audio handling with:
- Support for both local audio files and TTS
- Background audio playback
- Pause/resume functionality
- Audio queue management

## 🔧 Configuration

### Environment Variables
```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Firebase Setup
1. Create a new Firebase project
2. Enable Firestore database
3. Set up authentication (optional)
4. Configure security rules
5. Add sample waypoint data

## 📱 Platform Support

- **iOS**: Full support with native audio and location services
- **Android**: Complete functionality with background location tracking
- **Web**: Limited support for development and testing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the amazing development platform
- **React Native Community**: For the excellent ecosystem
- **Google Maps**: For reliable mapping services
- **Firebase**: For scalable backend infrastructure

---

**Made with ❤️ for curious travelers everywhere**

*Curious Road - Where every journey tells a story*
