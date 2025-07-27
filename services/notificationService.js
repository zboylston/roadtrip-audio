import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const GEOFENCE_TASK = 'WAYPOINT_GEOFENCE_TASK';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  // Request notification permissions
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }
      
      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Play approach notification audio
  async playApproachNotification() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/approach-notification.mp3'),
        { shouldPlay: true, volume: 1.0 }
      );
      
      // Clean up after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      
      console.log('Playing approach notification sound from notification service');
    } catch (error) {
      console.error('Error playing approach notification:', error);
    }
  },

  // Schedule a local notification
  async scheduleNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
      console.log('Notification scheduled:', title);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  // Set up geofencing for waypoints
  async setupGeofencing(waypoints) {
    try {
      // Request background location permissions
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Background location permission denied');
        return false;
      }

      // Stop any existing geofencing first
      await this.stopGeofencing();

      // Define the geofencing task (only once)
      if (!TaskManager.isTaskDefined(GEOFENCE_TASK)) {
        TaskManager.defineTask(GEOFENCE_TASK, async ({ data: { eventType, region }, error }) => {
          if (error) {
            console.error('Geofencing task error:', error);
            return;
          }

          if (eventType === Location.GeofencingEventType.Enter) {
            // Geofencing is now only used for background location tracking
            // Notifications are handled by the manual detection system
            console.log('Geofence entered for waypoint:', region.identifier);
          }
        });
      }

      // Start geofencing for all waypoints
      const geofences = waypoints.map(wp => ({
        identifier: wp.id,
        latitude: wp.latitude,
        longitude: wp.longitude,
        radius: wp.radius || 1600, // Default 1 mile radius
        notifyOnEnter: true,
        notifyOnExit: false,
      }));

      await Location.startGeofencingAsync(GEOFENCE_TASK, geofences);
      console.log('Geofencing started for', geofences.length, 'waypoints');
      return true;
    } catch (error) {
      console.error('Error setting up geofencing:', error);
      return false;
    }
  },

  // Stop geofencing
  async stopGeofencing() {
    try {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
      console.log('Geofencing stopped');
    } catch (error) {
      console.error('Error stopping geofencing:', error);
    }
  },

  // Set up notification response listener
  setupNotificationListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  // Get notification settings
  async getNotificationSettings() {
    return await Notifications.getPermissionsAsync();
  },

  // Test notification
  async sendTestNotification() {
    await this.scheduleNotification(
      'Test Notification',
      'This is a test notification from Roadtrip Audio!',
      { test: true }
    );
  }
}; 