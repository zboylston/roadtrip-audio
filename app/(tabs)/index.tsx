import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { firebaseService } from '../../services/firebaseService.js';
import { notificationService } from '../../services/notificationService.js';

const { width: screenWidth } = Dimensions.get('window');

export default function WaypointsScreen() {
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [tripActive, setTripActive] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [approachingWaypoint, setApproachingWaypoint] = useState<string | null>(null);
  const [listenedWaypoints, setListenedWaypoints] = useState<Set<string>>(new Set());
  const [noRepeatStories, setNoRepeatStories] = useState<boolean>(false);
  const [lastStoryTime, setLastStoryTime] = useState<number>(0);
  const [recentlyPlayedWaypoints, setRecentlyPlayedWaypoints] = useState<Set<string>>(new Set());
  const recentlyPlayedRef = useRef<Set<string>>(new Set());
  const tripStartTimeRef = useRef<number>(0);
  const lastDetectionTimeRef = useRef<number>(0);
  const notifiedWaypointsRef = useRef<Set<string>>(new Set());
  const [backgroundAudioPlaying, setBackgroundAudioPlaying] = useState<boolean>(false);
  const [tripStartDelayActive, setTripStartDelayActive] = useState<boolean>(false);
  const [forceDetection, setForceDetection] = useState<number>(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const mapWebViewRef = useRef<WebView>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Temporarily use default settings until context is properly set up
  const settings = {
    notificationMode: 'notification' as 'autoplay' | 'notification',
    notificationsEnabled: false,
    backgroundLocationEnabled: true, // Default to true for road trip use case
    soundEnabled: true,
    vibrationEnabled: true,
    audioVolumeBoost: true, // Enable volume boost for car environment
  };
  // const { settings } = useSettings();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FDFBF7', // Warm cream background
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50
    },
    container: {
      flex: 1,
      backgroundColor: '#FDFBF7',
      padding: 0
    },
    header: { 
      backgroundColor: '#FDFBF7', 
      borderBottomWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      paddingTop: 24,
      paddingBottom: 16,
    },
    headerTitle: { 
      fontSize: 32, 
      fontWeight: '700', 
      color: '#2E5A3D',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
      letterSpacing: -0.5,
      textAlign: 'center',
      marginBottom: 16,
    },
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      gap: 12,
      flexWrap: 'wrap',
    },
    headerLeft: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 12,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    approachingBadge: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: '#FF8C42', 
      borderRadius: 20, 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      gap: 6,
      shadowColor: '#FF8C42',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      alignSelf: 'center',
      marginTop: 12,
    },
    approachingText: { 
      fontSize: 13, 
      fontWeight: '700', 
      color: '#fff',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    refreshButton: { 
      padding: 10,
      backgroundColor: '#F8F6F0',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0D8C8',
    },
    testButton: { 
      padding: 10,
      backgroundColor: '#F8F6F0',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0D8C8',
    },
    stopAllButton: { 
      padding: 10,
      backgroundColor: '#FFE8E0',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FF8C42',
    },
    autoPlayButton: { padding: 4 },
    tripButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 8,
      backgroundColor: tripActive ? '#E8F5E8' : '#F8F6F0',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: tripActive ? '#2E5A3D' : '#E0D8C8',
      shadowColor: tripActive ? '#2E5A3D' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: tripActive ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    tripButtonText: { 
      fontSize: 15, 
      color: tripActive ? '#2E5A3D' : '#666666', 
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    mapToggle: { 
      backgroundColor: '#F8F6F0',
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0D8C8',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    mapContainer: { 
      flex: 1, 
      borderRadius: 24, 
      overflow: 'hidden', 
      margin: 20, 
      marginTop: 12, 
      elevation: 8, 
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#E0D8C8',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    mapView: { flex: 1, minHeight: 300, borderRadius: 24 },
    listContent: { 
      paddingHorizontal: 20,
      paddingBottom: 32, 
      paddingTop: 12 
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 24,
      marginVertical: 8,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: '#F0F0F0',
      position: 'relative',
      overflow: 'hidden',
    },
    cardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: '#FF8C42',
      opacity: 0.8,
    },
    waypointHeader: {
      marginBottom: 12
    },
    waypointTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#2E2E2E',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
      letterSpacing: -0.3,
      lineHeight: 30,
      marginBottom: 8,
    },
    waypointMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    waypointMetaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    listenedBadge: {
      backgroundColor: '#E8F5E8',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: '#2E5A3D',
    },
    listenedText: {
      fontSize: 10,
      color: '#2E5A3D',
      fontWeight: '500',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    waypointDistance: {
      fontSize: 12,
      color: '#FF8C42',
      fontWeight: '500',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
      backgroundColor: '#FFF5F0',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FFE8E0',
    },
    waypointDistanceInactive: {
      fontSize: 10,
      color: '#999999',
      fontWeight: '400',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
      backgroundColor: '#F8F6F0',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#E0D8C8',
    },
    waypointDescription: {
      fontSize: 16,
      color: '#666666',
      lineHeight: 24,
      marginBottom: 20,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    audioControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    },
    playButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2E5A3D',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 16,
      gap: 8,
      shadowColor: '#2E5A3D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    playButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    stopButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#DC3545',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 16,
      gap: 8,
      shadowColor: '#DC3545',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    stopButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    loadingText: {
      color: '#666666',
      fontSize: 16,
      fontStyle: 'italic',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#2E2E2E',
      marginBottom: 12,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    emptyDescription: {
      fontSize: 18,
      color: '#666666',
      textAlign: 'center',
      lineHeight: 26,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: '#FDFBF7'
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#2E2E2E',
      marginBottom: 12,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    errorMessage: {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center',
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    locationIcon: {
      backgroundColor: '#F8F6F0',
      borderRadius: 12,
      padding: 8,
      borderWidth: 1,
      borderColor: '#E0D8C8',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    safetyDisclaimer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF8E1',
      padding: 12,
      margin: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FFE082',
      gap: 8,
    },
    safetyDisclaimerText: {
      flex: 1,
      fontSize: 12,
      color: '#8B4513',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
      lineHeight: 16,
    },
  });

  // --- Audio Session Management for Car Safety ---
  // These functions ensure waypoint stories are clearly audible by pausing background music
  // while respecting car audio safety requirements and providing a smooth user experience
  const configureAudioForWaypointPlayback = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false, // Don't duck, we want to pause completely
        playThroughEarpieceAndroid: false,
        // Car safety: Pause other audio when waypoint stories play
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
      console.log('Audio configured for waypoint playback - background music will be paused');
    } catch (error) {
      console.error('Error configuring audio for waypoint playback:', error);
    }
  };

  const restoreAudioSession = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false, // Stop ducking other audio
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
      console.log('Audio session restored - music can resume normally');
    } catch (error) {
      console.error('Error restoring audio session:', error);
    }
  };

  // Boost audio volume for better car environment audibility
  const boostAudioVolume = async (sound: Audio.Sound) => {
    try {
      // Set volume to maximum
      await sound.setVolumeAsync(1.0);
      
      // Additional volume boost for car environment if enabled
      if (settings.audioVolumeBoost) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          // Ensure we're at maximum volume with optimal settings
          await sound.setStatusAsync({ 
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: true,
          });
          console.log('Audio volume boosted for car environment');
        }
      } else {
        console.log('Audio volume boost disabled');
      }
    } catch (error) {
      console.error('Error boosting audio volume:', error);
    }
  };

  // --- Load waypoints from Firebase ---
  const loadWaypoints = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.initializeWithSampleData();
      setWaypoints(data);
      console.log('Waypoints loaded from Firebase:', data.length);
    } catch (error) {
      console.error('Error loading waypoints:', error);
      Alert.alert('Error', 'Failed to load waypoints from database');
    } finally {
      setLoading(false);
    }
  };

  const refreshWaypoints = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getWaypoints();
      setWaypoints(data);
      console.log('Waypoints refreshed from Firebase:', data.length);
    } catch (error) {
      console.error('Error refreshing waypoints:', error);
      Alert.alert('Error', 'Failed to refresh waypoints');
    } finally {
      setLoading(false);
    }
  };

  // Sort waypoints by distance from user location
  const getSortedWaypoints = () => {
    if (!userLocation) return waypoints;
    
    return [...waypoints].sort((a, b) => {
      const distA = getDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
      const distB = getDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
      return distA - distB; // Closest first
    });
  };

  // --- Local Storage Functions ---
  const loadUserPreferences = async () => {
    try {
      const listenedData = await AsyncStorage.getItem('listenedWaypoints');
      const noRepeatData = await AsyncStorage.getItem('noRepeatStories');
      
      if (listenedData) {
        setListenedWaypoints(new Set(JSON.parse(listenedData)));
      }
      
      if (noRepeatData) {
        setNoRepeatStories(JSON.parse(noRepeatData));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const saveListenedWaypoint = async (waypointId: string) => {
    try {
      const newListened = new Set(listenedWaypoints).add(waypointId);
      setListenedWaypoints(newListened);
      await AsyncStorage.setItem('listenedWaypoints', JSON.stringify([...newListened]));
    } catch (error) {
      console.error('Error saving listened waypoint:', error);
    }
  };

  const toggleNoRepeatStories = async () => {
    try {
      const newValue = !noRepeatStories;
      setNoRepeatStories(newValue);
      await AsyncStorage.setItem('noRepeatStories', JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving no repeat setting:', error);
    }
  };

  const clearListenedHistory = async () => {
    try {
      setListenedWaypoints(new Set());
      await AsyncStorage.removeItem('listenedWaypoints');
      Alert.alert('Success', 'Listening history cleared!');
    } catch (error) {
      console.error('Error clearing history:', error);
      Alert.alert('Error', 'Failed to clear history');
    }
  };

  useEffect(() => {
    loadWaypoints();
    loadUserPreferences();
    
    // Configure audio for background playback with car safety features
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false, // Don't duck by default
          playThroughEarpieceAndroid: false,
          // Car safety: Pause other audio when waypoint stories play
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
        console.log('Audio configured for background playback with car safety features');
      } catch (error) {
        console.error('Error configuring audio:', error);
      }
    };
    
    configureAudio();
    
    // Cleanup function for component unmount
    return () => {
      // Stop any playing audio
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      // Stop any TTS
      Speech.stop();
      // Stop geofencing
      notificationService.stopGeofencing();
    };
  }, []);

  // --- Setup notifications and geofencing ---
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permissionsGranted = await notificationService.requestPermissions();
        setNotificationsEnabled(permissionsGranted);
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    if (waypoints.length > 0) {
      setupNotifications();
    }
  }, [waypoints]);

  // --- Start/Stop geofencing based on trip state ---
  useEffect(() => {
    const handleGeofencing = async () => {
      try {
        if (tripActive && waypoints.length > 0 && notificationsEnabled) {
          // Start geofencing when trip is active
          await notificationService.setupGeofencing(waypoints);
          console.log('Geofencing started for trip');
        } else if (!tripActive) {
          // Stop geofencing when trip is not active
          await notificationService.stopGeofencing();
          console.log('Geofencing stopped - trip not active');
        }
      } catch (error) {
        console.error('Error handling geofencing:', error);
      }
    };

    handleGeofencing();
    
    // Cleanup: stop geofencing when component unmounts
    return () => {
      notificationService.stopGeofencing();
    };
  }, [tripActive, waypoints, notificationsEnabled]);

  // --- Handle notification taps ---
  useEffect(() => {
    const subscription = notificationService.setupNotificationListener((response: any) => {
      const { waypointId, waypointTitle } = response.notification.request.content.data;
      
      if (waypointId) {
        console.log('Notification tapped for waypoint:', waypointTitle);
        
        // Only play audio if trip is active
        if (tripActive) {
          const waypoint = waypoints.find(wp => wp.id === waypointId);
          if (waypoint) {
            const textContent = waypoint.textContent || '';
            playAudio(textContent, waypointId);
          }
        } else {
          console.log('Trip not active, ignoring notification tap');
        }
      }
    });

    return () => subscription?.remove();
  }, [waypoints, tripActive]);

  // --- Permissions ---
  useEffect(() => {
    (async () => {
      try {
        // Request foreground location permission
        const foregroundStatus = await Location.requestForegroundPermissionsAsync();
        console.log('Foreground location permission status:', foregroundStatus.status);
        
        // Request background location permission for geofencing
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        console.log('Background location permission status:', backgroundStatus.status);
        
        if (foregroundStatus.status === 'granted' && backgroundStatus.status === 'granted') {
          console.log('All location permissions granted successfully');
        } else {
          console.log('Some location permissions were denied');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    })();
  }, []);

  // --- Location tracking ---
  useEffect(() => {
    let locationSub: any = null;
    if (tripActive) {
      tripStartTimeRef.current = Date.now();
      setTripStartDelayActive(true);
      console.log('Trip started at:', new Date(tripStartTimeRef.current).toLocaleTimeString());
      
      // Clear the delay after 30 seconds
      setTimeout(() => {
        setTripStartDelayActive(false);
        console.log('Trip start delay ended - notifications now active');
              // Force a waypoint detection check after the delay ends
      console.log('Forcing waypoint detection after delay ended');
      // Trigger the detection by updating the forceDetection state
      setForceDetection(Date.now());
      }, 30 * 1000);
      (async () => {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;
          locationSub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
            loc => setUserLocation(loc.coords)
          );
          console.log('Location tracking started');
        } catch (error) {
          console.error('Error starting location tracking:', error);
        }
      })();
    } else {
      setUserLocation(null);
      setApproachingWaypoint(null);
      setTripStartDelayActive(false);
      recentlyPlayedRef.current.clear(); // Reset rotation when trip stops
      notifiedWaypointsRef.current.clear(); // Reset notifications when trip stops
    }
    return () => { if (locationSub) locationSub.remove(); };
  }, [tripActive]);

  // --- Check for approaching waypoints and handle notifications/auto-play ---
  useEffect(() => {
    if (!userLocation || !waypoints.length || !tripActive) {
      console.log('Waypoint detection skipped - conditions not met:', {
        hasUserLocation: !!userLocation,
        waypointsLength: waypoints.length,
        tripActive: tripActive
      });
      return;
    }
    
    // Don't detect new waypoints while audio is playing
    if (playingId || backgroundAudioPlaying) {
      console.log('Skipping waypoint detection - audio is currently playing');
      return;
    }
    
    const currentTime = Date.now();
    const detectionCooldown = 5 * 1000; // 5 seconds between detections
    
    // Prevent rapid-fire detections
    if (currentTime - lastDetectionTimeRef.current < detectionCooldown) {
      console.log('Skipping detection - too soon since last one');
      return;
    }
    
    lastDetectionTimeRef.current = currentTime;
    
    console.log('=== WAYPOINT DETECTION RUNNING ===');
    console.log('User location:', userLocation.latitude, userLocation.longitude);
    console.log('Total waypoints:', waypoints.length);
    
    // Find all waypoints within 5 miles and sort by distance
    const nearbyWaypoints = waypoints
      .filter(wp => {
        const lat = wp.latitude;
        const lon = wp.longitude;
        if (!lat || !lon) return false;
        
        const dist = getDistance(userLocation.latitude, userLocation.longitude, lat, lon);
        return dist < 8047; // Within 5 miles
      })
      .sort((a, b) => {
        const distA = getDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
        const distB = getDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
        return distA - distB; // Closest first
      });
    
    console.log('Nearby waypoints found:', nearbyWaypoints.length);
    if (nearbyWaypoints.length > 0) {
      console.log('Closest waypoint:', nearbyWaypoints[0].title, 'at', (getDistance(userLocation.latitude, userLocation.longitude, nearbyWaypoints[0].latitude, nearbyWaypoints[0].longitude) / 1609.34).toFixed(1), 'miles');
    }
    
    // Find the best waypoint to trigger (closest unlistened if no-repeat is on)
    let bestWaypoint = null;
    
    if (noRepeatStories) {
      // Find closest unlistened waypoint
      bestWaypoint = nearbyWaypoints.find(wp => !listenedWaypoints.has(wp.id));
      
      // If all nearby waypoints have been listened to, don't trigger anything
      if (!bestWaypoint) {
        // Reset approaching state since we're not triggering anything
        if (approachingWaypoint) {
          setApproachingWaypoint(null);
        }
        return;
      }
    } else {
      // Rotation system: find the closest waypoint that hasn't been played recently
      // If all nearby waypoints have been played recently, reset the recently played list
      let availableWaypoints = nearbyWaypoints.filter(wp => !recentlyPlayedRef.current.has(wp.id));
      
      if (availableWaypoints.length === 0) {
        // All nearby waypoints have been played recently, reset the list
        recentlyPlayedRef.current.clear();
        availableWaypoints = nearbyWaypoints;
      }
      
      // Choose the closest available waypoint
      bestWaypoint = availableWaypoints[0];
    }
    
    // Handle approaching state and notifications
    if (bestWaypoint && approachingWaypoint !== bestWaypoint.id) {
      const currentTime = Date.now();
      // Unified cooldown: Both notifications and auto-play respect the same 15-minute rest period
      const storyCooldownPeriod = 15 * 60 * 1000; // 15 minutes between stories
      const tripStartDelay = 30 * 1000; // 30 seconds delay after trip starts
      
      // Prevent notifications immediately after trip starts
      if (currentTime - tripStartTimeRef.current < tripStartDelay) {
        const remainingDelay = Math.ceil((tripStartDelay - (currentTime - tripStartTimeRef.current)) / 1000);
        console.log(`Skipping notification - trip just started, waiting ${remainingDelay} more seconds`);
        return;
      }
      
      console.log('Notification check - Trip start delay passed, checking story cooldown...');
      console.log('Notification check - Current time:', currentTime);
      console.log('Notification check - Trip start time:', tripStartTimeRef.current);
      console.log('Notification check - Last story time:', lastStoryTime);
      console.log('Notification check - Time since trip start:', currentTime - tripStartTimeRef.current);
      console.log('Notification check - Time since last story:', currentTime - lastStoryTime);
      console.log('Notification check - Story cooldown period:', storyCooldownPeriod);
      console.log('Notification check - Is within cooldown period:', currentTime - lastStoryTime < storyCooldownPeriod);
      
      // Prevent notifications too soon after the last story finished (same cooldown as auto-play)
      if (currentTime - lastStoryTime < storyCooldownPeriod) {
        const remainingCooldown = Math.ceil((storyCooldownPeriod - (currentTime - lastStoryTime)) / 1000 / 60);
        console.log(`Skipping notification - too soon since last story finished, waiting ${remainingCooldown} more minutes`);
        return;
      }
      
      // Only send notification if we haven't already notified for this waypoint recently
      if (notifiedWaypointsRef.current.has(bestWaypoint.id)) {
        console.log('Skipping notification - waypoint already notified this session');
        return;
      }
      
      console.log(`Selected waypoint: ${bestWaypoint.title} (${nearbyWaypoints.length} nearby, no-repeat: ${noRepeatStories}, recently played: ${recentlyPlayedRef.current.size})`);
      setApproachingWaypoint(bestWaypoint.id);
      notifiedWaypointsRef.current.add(bestWaypoint.id);
      
      // Always send notification for the best waypoint
      notificationService.scheduleNotification(
        'Approaching Waypoint',
        `You're approaching: ${bestWaypoint.title}`,
        { waypointId: bestWaypoint.id, waypointTitle: bestWaypoint.title }
      );
      
      // Play approach notification sound only in "Alert Me" mode
      if (settings.notificationMode === 'notification') {
        console.log('Calling playApproachNotification() - notification mode is active');
        playApproachNotification();
      } else {
        console.log('Skipping approach notification - notification mode is:', settings.notificationMode);
      }
      
      // Auto-play story if in auto-play mode (with cooldown check)
      if (settings.notificationMode === 'autoplay') {
        const textContent = bestWaypoint.textContent;
        const hasAudio = bestWaypoint.textContent || bestWaypoint.audioUrl || bestWaypoint.audioFile;
        const currentTime = Date.now();
        
        // Check if enough time has passed since last story AND we're not currently playing
        if (hasAudio && !playingId && (currentTime - lastStoryTime) > storyCooldownPeriod) {
          playAudio(textContent || '', bestWaypoint.id);
        }
      }
    } else if (nearbyWaypoints.length === 0) {
      // Reset approaching state when no waypoints are nearby
      if (approachingWaypoint) {
        setApproachingWaypoint(null);
      }
    }
  }, [userLocation, waypoints, tripActive, approachingWaypoint, settings.notificationMode, noRepeatStories, listenedWaypoints, lastStoryTime, playingId, forceDetection]);

  // --- Update user location on map ---
  useEffect(() => {
    if (userLocation && mapWebViewRef.current && showMap) {
      const updateLocationScript = `
        if (window.updateUserLocation) {
          window.updateUserLocation(${userLocation.latitude}, ${userLocation.longitude});
        }
      `;
      mapWebViewRef.current.injectJavaScript(updateLocationScript);
    }
  }, [userLocation, showMap]);

  // --- Render waypoint card ---
  const renderWaypointCard = ({ item: waypoint }: { item: any }) => {
    const distance = userLocation 
      ? `${(getDistance(userLocation.latitude, userLocation.longitude, waypoint.latitude, waypoint.longitude) / 1609.34).toFixed(1)} mi`
      : tripActive ? 'Calculating...' : 'Start trip to see distance';
    
    const isPlaying = playingId === waypoint.id;
    const hasAudio = waypoint.audioUrl || waypoint.audioFile;
    const isListened = listenedWaypoints.has(waypoint.id);

    return (
              <View style={styles.card}>
          <View style={styles.cardGradient} />
          
          <View style={styles.waypointHeader}>
            <Text style={styles.waypointTitle} numberOfLines={2}>
              {waypoint.title}
            </Text>
          </View>
          
          <View style={styles.waypointMetaRow}>
            <View style={styles.waypointMetaLeft}>
              <TouchableOpacity style={styles.locationIcon} onPress={() => showWaypointOnMap(waypoint)}>
                <Ionicons name="location" size={16} color="#FF8C42" />
              </TouchableOpacity>
              <Text style={tripActive ? styles.waypointDistance : styles.waypointDistanceInactive}>
                {distance}
              </Text>
            </View>
            {isListened && (
              <View style={styles.listenedBadge}>
                <Text style={styles.listenedText}>Listened</Text>
              </View>
            )}
          </View>
        
        <Text style={styles.waypointDescription} numberOfLines={3}>
          {waypoint.description}
        </Text>
        
        <View style={styles.audioControls}>
          {hasAudio ? (
            <>
              {isPlaying ? (
                <>
                  <TouchableOpacity 
                    style={styles.playButton} 
                    onPress={paused ? resumeAudio : pauseAudio}
                  >
                    <Ionicons 
                      name={paused ? "play" : "pause"} 
                      size={18} 
                      color="#fff" 
                    />
                    <Text style={styles.playButtonText}>
                      {paused ? "Resume" : "Pause"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.stopButton} 
                    onPress={stopAudio}
                  >
                    <Ionicons name="stop" size={18} color="#fff" />
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={() => playAudio(waypoint.description, waypoint.id, waypoint.audioUrl || waypoint.audioFile)}
                  disabled={audioLoading}
                >
                  <Ionicons name="play" size={18} color="#fff" />
                  <Text style={styles.playButtonText}>
                    {audioLoading ? "Loading..." : "Play Story"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.loadingText}>No audio available</Text>
          )}
        </View>
      </View>
    );
  };

  // --- Cleanup audio on unmount ---
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play approach notification sound
  const playApproachNotification = async () => {
    try {
      console.log('Starting approach notification sound...');
      
      // Stop any currently playing audio first
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Load and play the approach notification sound with car safety features
      console.log('Loading approach notification audio file...');
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audio/approach-notification.mp3'),
        { 
          shouldPlay: true, 
          volume: 1.0, // Maximum volume
          // Car safety: Ensure approach notification is clearly audible
          rate: 1.0,
          shouldCorrectPitch: true,
          // Pause other audio (music, etc.) when approach notification plays
          androidImplementation: 'MediaPlayer',
        }
      );
      
      console.log('Approach notification audio loaded successfully');
      
      // Boost volume for maximum audibility in car environment
      await boostAudioVolume(sound);
      
      // Store reference to clean up later
      soundRef.current = sound;
      
      // Clean up after playing and restore audio session
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded) {
          console.log('Approach notification status:', status);
          if (status.didJustFinish) {
            soundRef.current = null;
            console.log('Approach notification finished, restoring audio session');
            // Restore audio session to allow music to resume normally
            await restoreAudioSession();
          }
        }
      });
      
      console.log('Playing approach notification sound - background music will be paused');
    } catch (error) {
      console.error('Error playing approach notification:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      // Fallback to TTS if audio file fails
      Speech.speak("You're approaching a waypoint! Open the app and accept the story to listen in.");
    }
  };



  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const playAudio = async (textContent: string, id: string, audioFile?: string) => {
    try {
      // Stop any currently playing audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Stop any TTS that might be playing
      Speech.stop();

      setPlayingId(id);
      setPaused(false);
      setAudioLoading(true);

      // Configure audio session for waypoint playback (duck other audio)
      await configureAudioForWaypointPlayback();

      // Track that this waypoint was listened to
      await saveListenedWaypoint(id);
      
      // Add to recently played waypoints for rotation system
      recentlyPlayedRef.current.add(id);

      // Find the waypoint to get the correct audio URL
      const waypoint = waypoints.find(wp => wp.id === id);
      const audioUrl = waypoint?.audioUrl || waypoint?.audioFile || audioFile;

      // Try to play audio file first, fallback to TTS
      if (audioUrl) {
        try {
          console.log('Loading audio file:', audioUrl);
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { 
              shouldPlay: true,
              progressUpdateIntervalMillis: 1000,
              // Car safety: Ensure waypoint stories are clearly audible
              volume: 1.0, // Maximum volume
              rate: 1.0,
              shouldCorrectPitch: true,
              // Pause other audio (music, etc.) when waypoint story plays
              androidImplementation: 'MediaPlayer',
            }
          );
          
          // Boost volume for maximum audibility in car environment
          await boostAudioVolume(sound);
          soundRef.current = sound;
          
          sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isLoaded) {
              setAudioLoading(false);
              if (status.didJustFinish) {
                setPlayingId(null);
                setPaused(false);
                setBackgroundAudioPlaying(false);
                // Record the time this story finished (for cooldown)
                setLastStoryTime(Date.now());
                
                // Restore audio session to allow music to resume normally
                await restoreAudioSession();
              } else if (status.isPlaying) {
                setBackgroundAudioPlaying(true);
              } else if (!status.isPlaying) {
                setBackgroundAudioPlaying(false);
              }
            }
          });
          
          console.log('Playing audio file for waypoint:', id);
          return;
        } catch (audioError) {
          console.log('Audio file failed, falling back to TTS:', audioError);
        }
      }

      // Fallback to TTS if no audio file or audio file failed
      if (textContent) {
        // Configure TTS for maximum volume and clarity in car environment
        Speech.speak(textContent, {
          rate: 0.9, // Slightly slower for better comprehension
          pitch: 1.0, // Normal pitch
          volume: 1.0, // Maximum volume
          language: 'en-US', // Ensure English pronunciation
        });
        setAudioLoading(false);
        console.log('Playing TTS for waypoint:', id);
        
        // For TTS, we'll set a timeout to approximate when it finishes
        // TTS duration is roughly 150 words per minute
        const wordCount = textContent.split(' ').length;
        const estimatedDuration = (wordCount / 150) * 60 * 1000; // milliseconds
        
        setTimeout(async () => {
          if (playingId === id) {
            setPlayingId(null);
            setPaused(false);
            // Record the time this story finished (for cooldown)
            setLastStoryTime(Date.now());
            
            // Restore audio session to allow music to resume normally
            await restoreAudioSession();
          }
        }, estimatedDuration);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioLoading(false);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const pauseAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        setPaused(true);
        console.log('Audio paused');
      } else {
        // For TTS, we can't pause, so we'll stop and restart later
        Speech.stop();
        setPaused(true);
        console.log('TTS stopped');
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const resumeAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setPaused(false);
        console.log('Audio resumed');
      } else {
        // For TTS, we can't resume, so we'll just set as not paused
        setPaused(false);
        console.log('TTS resumed (restart required)');
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      // Stop any playing audio file
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      // Stop TTS
      Speech.stop();
      
      // Reset all states
      setPlayingId(null);
      setPaused(false);
      setAudioLoading(false);
      setBackgroundAudioPlaying(false);
      
      // Restore audio session to allow music to resume normally
      await restoreAudioSession();
      
      console.log('Audio stopped and session restored - music can resume normally');
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  // --- Test notification function ---
  const testNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  // --- Test approach sound function ---
  const testApproachSound = async () => {
    try {
      await playApproachNotification();
      console.log('Test approach sound played');
    } catch (error) {
      console.error('Error playing test approach sound:', error);
      Alert.alert('Error', 'Failed to play approach sound');
    }
  };

  const showWaypointOnMap = (waypoint: any) => {
    // Switch to map view
    setShowMap(true);
    
    // Center the map on the waypoint location
    if (mapWebViewRef.current && waypoint.latitude && waypoint.longitude) {
      const centerMapScript = `
        if (window.centerMapOnWaypoint) {
          window.centerMapOnWaypoint(${waypoint.latitude}, ${waypoint.longitude});
        }
      `;
      mapWebViewRef.current.injectJavaScript(centerMapScript);
    }
  };

    // Create map HTML with waypoints and user location
  const createMapHTML = () => {
    const centerLat = userLocation?.latitude || waypoints[0]?.latitude || 35.2271;
    const centerLng = userLocation?.longitude || waypoints[0]?.longitude || -80.8431;
    
    const waypointsData = waypoints.map(wp => ({
      id: wp.id,
      title: wp.title,
      lat: wp.latitude,
      lng: wp.longitude,
      description: wp.description
    }));

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log('Using Google Maps API key:', apiKey ? 'Key provided' : 'No key found');
    console.log('API Key value:', apiKey);
    console.log('Environment variables:', {
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY
    });

    // Use the working API key directly since we know it works
    const workingApiKey = 'AIzaSyCDQXf_9ZvegcSGuCUW8SiV6caEgHR6_wo';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            html, body, #map { height: 100%; margin: 0; padding: 0; }
            .info-window { max-width: 200px; }
            .info-window h3 { margin: 0 0 8px 0; font-size: 16px; }
            .info-window p { margin: 0; font-size: 14px; color: #666; }
            .error-container { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100%; 
              padding: 20px; 
              text-align: center; 
              background: #f8f9fa; 
              color: #666; 
            }
            .error-icon { font-size: 48px; margin-bottom: 16px; }
            .error-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #333; }
            .error-message { font-size: 14px; line-height: 1.4; }
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              background: #f8f9fa;
            }
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #e0e0e0;
              border-top: 4px solid #007AFF;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 16px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div id="map">
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <div class="error-title">Loading Map...</div>
              <div class="error-message">Please wait while we initialize the map</div>
            </div>
          </div>
          <script>
            let map, userMarker;
            const waypoints = ${JSON.stringify(waypointsData)};
            const userLocation = ${userLocation ? JSON.stringify({lat: userLocation.latitude, lng: userLocation.longitude}) : 'null'};
            const apiKey = '${workingApiKey}';
            
            function showError(message) {
              document.getElementById('map').innerHTML = \`
                <div class="error-container">
                  <div class="error-icon">🗺️</div>
                  <div class="error-title">Map Unavailable</div>
                  <div class="error-message">\${message}</div>
                  <div style="margin-top: 16px; font-size: 12px; color: #999;">
                    API Key: \${apiKey ? 'Provided' : 'Missing'}
                  </div>
                  <div style="margin-top: 8px; font-size: 10px; color: #999;">
                    Debug: API Key starts with \${apiKey ? apiKey.substring(0, 10) + '...' : 'None'}
                  </div>
                </div>
              \`;
            }
            
            function initMap() {
              try {
                console.log('Initializing map with API key:', apiKey ? 'Present' : 'Missing');
                console.log('API Key value:', apiKey);
                console.log('Waypoints count:', waypoints.length);
                
                // Check if Google Maps API is loaded
                if (typeof google === 'undefined' || !google.maps) {
                  showError('Google Maps API failed to load. Please check your internet connection and API key configuration.');
                  return;
                }
                
                map = new google.maps.Map(document.getElementById('map'), {
                  center: { lat: ${centerLat}, lng: ${centerLng} },
                  zoom: 10,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  styles: [
                    {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [{ visibility: 'off' }]
                    }
                  ]
                });

                // Add waypoint markers
                waypoints.forEach(function(wp) {
                  if (wp.lat && wp.lng) {
                    const marker = new google.maps.Marker({
                      position: { lat: wp.lat, lng: wp.lng },
                      map: map,
                      title: wp.title || 'Waypoint',
                      icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="#007AFF" stroke="white" stroke-width="2"/>
                            <circle cx="12" cy="12" r="4" fill="white"/>
                          </svg>
                        \`),
                        scaledSize: new google.maps.Size(24, 24),
                        anchor: new google.maps.Point(12, 12)
                      }
                    });

                    // Add info window
                    const infoWindow = new google.maps.InfoWindow({
                      content: \`
                        <div class="info-window">
                          <h3>\${wp.title}</h3>
                          <p>\${wp.description || 'Waypoint'}</p>
                        </div>
                      \`
                    });

                    marker.addListener('click', () => {
                      infoWindow.open(map, marker);
                    });
                  }
                });

                // Add user location marker
                if (userLocation) {
                  userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                    icon: {
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="8" fill="#FF3B30" stroke="white" stroke-width="2"/>
                          <circle cx="10" cy="10" r="3" fill="white"/>
                        </svg>
                      \`),
                      scaledSize: new google.maps.Size(20, 20),
                      anchor: new google.maps.Point(10, 10)
                    }
                  });

                  // Center map on user location
                  map.setCenter(userLocation);
                  map.setZoom(12);
                }

                console.log('Map initialized successfully with', waypoints.length, 'waypoints');
              } catch (err) {
                console.error('Map error:', err);
                showError('Failed to initialize map: ' + err.message);
              }
            }

            // Update user location
            function updateUserLocation(lat, lng) {
              if (userMarker) {
                userMarker.setPosition({ lat: lat, lng: lng });
                map.setCenter({ lat: lat, lng: lng });
              }
            }

            // Center map on specific waypoint
            function centerMapOnWaypoint(lat, lng) {
              if (map) {
                map.setCenter({ lat: lat, lng: lng });
                map.setZoom(14);
              }
            }

            // Expose functions to parent
            window.updateUserLocation = updateUserLocation;
            window.centerMapOnWaypoint = centerMapOnWaypoint;
            
            // Handle script load errors
            window.addEventListener('error', function(e) {
              if (e.target && e.target.src && e.target.src.includes('maps.googleapis.com')) {
                showError('Google Maps API failed to load. Please check your internet connection and API key.');
              }
            });
          </script>
          <script
            src="https://maps.googleapis.com/maps/api/js?key=${workingApiKey}&callback=initMap"
            async
            defer
            onerror="showError('Google Maps API failed to load. Please check your internet connection and API key configuration.')"></script>
        </body>
      </html>
    `;
  };

  if (loading) return (
    <View style={styles.safeArea}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#2E5A3D" />
        <Text style={styles.loadingText}>Loading waypoints...</Text>
      </View>
    </View>
  );

  if (waypoints.length === 0) return (
    <View style={styles.safeArea}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={64} color="#999" />
        <Text style={styles.emptyTitle}>No Waypoints Found</Text>
        <Text style={styles.emptyDescription}>
          Waypoints will appear here once they're loaded from the database.
        </Text>
        <TouchableOpacity style={styles.playButton} onPress={refreshWaypoints}>
          <Text style={styles.playButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Curious Road</Text>
          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshWaypoints}>
              <Ionicons name="refresh" size={20} color="#2E5A3D" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.testButton} onPress={testApproachSound}>
              <Ionicons name="volume-high" size={20} color="#2E5A3D" />
            </TouchableOpacity>
            {playingId && (
              <TouchableOpacity style={styles.stopAllButton} onPress={stopAudio}>
                <Ionicons name="stop" size={20} color="#FF8C42" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.tripButton} 
              onPress={() => setTripActive(!tripActive)}
            >
              <Ionicons 
                name={tripActive ? "pause" : "play"} 
                size={18} 
                color={tripActive ? "#2E5A3D" : "#666666"} 
              />
              <Text style={styles.tripButtonText}>
                {tripActive ? "Stop Trip" : "Start Trip"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapToggle} 
              onPress={() => setShowMap(!showMap)}
            >
              <Ionicons 
                name={showMap ? "list" : "map"} 
                size={20} 
                color="#2E5A3D" 
              />
            </TouchableOpacity>
          </View>
          {approachingWaypoint && (
            <View style={styles.approachingBadge}>
              <Ionicons name="location" size={14} color="#fff" />
              <Text style={styles.approachingText}>Waypoint Nearby</Text>
            </View>
          )}
          {(playingId || backgroundAudioPlaying) && (
            <View style={[styles.approachingBadge, { backgroundColor: '#2E5A3D', marginTop: 8 }]}>
              <Ionicons name="musical-notes" size={14} color="#fff" />
              <Text style={styles.approachingText}>Story Playing - Detection Paused</Text>
            </View>
          )}
          {tripStartDelayActive && (
            <View style={[styles.approachingBadge, { backgroundColor: '#8B4513', marginTop: 8 }]}>
              <Ionicons name="time" size={14} color="#fff" />
              <Text style={styles.approachingText}>Starting Trip - Notifications in 30s</Text>
            </View>
          )}
        </View>

        {showMap ? (
          <View style={styles.mapContainer}>
            <WebView
              ref={mapWebViewRef}
              source={{ html: createMapHTML() }}
              style={styles.mapView}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('WebView error:', nativeEvent);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('WebView HTTP error:', nativeEvent);
              }}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'waypoint_selected') {
                    const waypoint = waypoints.find(wp => wp.id === data.waypointId);
                    if (waypoint) {
                      playAudio(waypoint.textContent || waypoint.description, waypoint.id);
                    }
                  }
                } catch (error) {
                  console.error('Error parsing WebView message:', error);
                }
              }}
              renderError={(errorDomain, errorCode, errorDesc) => (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Map Loading Error</Text>
                  <Text style={styles.errorMessage}>
                    {errorDesc || 'Failed to load map. Please check your internet connection and try again.'}
                  </Text>
                </View>
              )}
            />
          </View>
        ) : (
          <FlatList
            data={getSortedWaypoints()}
            keyExtractor={(item) => item.id}
            renderItem={renderWaypointCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {/* Safety Disclaimer */}
        <View style={styles.safetyDisclaimer}>
          <Ionicons name="warning" size={16} color="#8B4513" />
          <Text style={styles.safetyDisclaimerText}>
            Drive safely. Stories play automatically and continue in background. Focus on the road.
          </Text>
        </View>
      </View>
    </View>
  );
} 