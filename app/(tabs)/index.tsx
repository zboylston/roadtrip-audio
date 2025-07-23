import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import CuriousRoadLogo from '../../components/CuriousRoadLogo';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { firebaseService } from '../../services/firebaseService.js';
import { notificationService } from '../../services/notificationService.js';

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
  const soundRef = useRef<Audio.Sound | null>(null);
  const mapWebViewRef = useRef<WebView>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Temporarily comment out settings context to troubleshoot
  // const { settings } = useSettings();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 0
    },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: 12, 
      paddingTop: 16,
      backgroundColor: '#fff', 
      borderBottomWidth: 1, 
      borderBottomColor: '#e0e0e0' 
    },
    headerLeft: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 8,
      flex: 1,
      marginRight: 8
    },
    headerTitle: { 
      fontSize: 22, 
      fontWeight: 'bold', 
      color: '#2c5aa0',
      fontFamily: 'System'
    },
    approachingBadge: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: '#ff6b35', 
      borderRadius: 10, 
      paddingHorizontal: 6, 
      paddingVertical: 2, 
      gap: 3 
    },
    approachingText: { fontSize: 11, fontWeight: '600', color: '#fff' },
    headerButtons: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 6,
      flexShrink: 0
    },
    refreshButton: { padding: 4 },
    testButton: { padding: 4 },
    stopAllButton: { padding: 4 },
    autoPlayButton: { padding: 4 },
    tripButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 4,
      backgroundColor: '#f8f9fa',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#e0e0e0'
    },
    tripButtonText: { 
      fontSize: 14, 
      color: '#2c5aa0', 
      marginLeft: 2,
      fontWeight: '600'
    },
    mapToggle: { 
      marginLeft: 6,
      backgroundColor: '#f8f9fa',
      padding: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#e0e0e0'
    },
    mapContainer: { 
      flex: 1, 
      borderRadius: 18, 
      overflow: 'hidden', 
      margin: 16, 
      marginTop: 8, 
      elevation: 4, 
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#e0e0e0'
    },
    mapView: { flex: 1, minHeight: 300, borderRadius: 18 },
    listContent: { paddingBottom: 32, paddingTop: 8 },
    card: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 6,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: '#f0f0f0'
    },
    waypointHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8
    },
    waypointTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      flex: 1,
      marginRight: 8
    },
    waypointDistance: {
      fontSize: 14,
      color: '#666',
      fontWeight: '500'
    },
    waypointDescription: {
      fontSize: 14,
      color: '#666',
      lineHeight: 20,
      marginBottom: 12
    },
    audioControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    playButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2c5aa0',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6
    },
    playButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600'
    },
    stopButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#dc3545',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6
    },
    stopButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600'
    },
    loadingText: {
      color: '#666',
      fontSize: 14,
      fontStyle: 'italic'
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
      textAlign: 'center'
    },
    emptyDescription: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      lineHeight: 24
    }
  });

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

  useEffect(() => {
    loadWaypoints();
  }, []);

  // --- Setup notifications and geofencing ---
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permissionsGranted = await notificationService.requestPermissions();
        setNotificationsEnabled(permissionsGranted);
        
        if (permissionsGranted && waypoints.length > 0) {
          await notificationService.setupGeofencing(waypoints);
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    if (waypoints.length > 0) {
      setupNotifications();
    }
  }, [waypoints]);

  // --- Handle notification taps ---
  useEffect(() => {
    const subscription = notificationService.setupNotificationListener((response: any) => {
      const waypointId = response.notification.request.content.data.waypointId;
      if (waypointId) {
        const waypoint = waypoints.find(wp => wp.id === waypointId);
        if (waypoint) {
          playAudio(waypoint.textContent || '', waypoint.id);
        }
      }
    });

    return () => subscription.remove();
  }, [waypoints]);

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
    }
    return () => { if (locationSub) locationSub.remove(); };
  }, [tripActive]);

  // --- Check for approaching waypoints ---
  useEffect(() => {
    if (!userLocation || !waypoints.length || !tripActive) return;
    
    for (const wp of waypoints) {
      const lat = wp.latitude;
      const lon = wp.longitude;
      if (lat && lon) {
        const dist = getDistance(userLocation.latitude, userLocation.longitude, lat, lon);
        
        // Check if approaching waypoint (within 2 miles but not too close)
        if (dist < 3218 && dist > 1609 && approachingWaypoint !== wp.id) {
          setApproachingWaypoint(wp.id);
          
          // Send notification and play alert
          notificationService.scheduleNotification(
            'Approaching Waypoint',
            `You're approaching: ${wp.title}`,
            { waypointId: wp.id, waypointTitle: wp.title }
          );
          
          // Play audio alert
          Speech.speak("You're approaching a waypoint! Open the app and accept the story to listen in.");
          break;
        } else if (dist > 3218) {
          // Reset approaching state when moving away
          if (approachingWaypoint === wp.id) {
            setApproachingWaypoint(null);
          }
        }
      }
    }
  }, [userLocation, waypoints, tripActive, approachingWaypoint]);

  // --- Auto-play when near waypoint ---
  useEffect(() => {
    // Temporarily disable auto-play to troubleshoot
    // if (!userLocation || !waypoints.length || !settings.autoPlayEnabled || !tripActive) return;
    if (!userLocation || !waypoints.length || !tripActive) return;
    for (const wp of waypoints) {
      const lat = wp.latitude;
      const lon = wp.longitude;
      const textContent = wp.textContent;
      const hasAudio = wp.textContent || wp.audioUrl || wp.audioFile;
      if (lat && lon && hasAudio && playingId !== wp.id) {
        const dist = getDistance(userLocation.latitude, userLocation.longitude, lat, lon);
        if (dist < 8047) {
          playAudio(textContent || '', wp.id);
          break;
        }
      }
    }
  }, [userLocation, waypoints, tripActive]);

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
      : 'Distance unknown';
    
    const isPlaying = playingId === waypoint.id;
    const hasAudio = waypoint.audioUrl || waypoint.audioFile;

    return (
      <View style={styles.card}>
        <View style={styles.waypointHeader}>
          <Text style={styles.waypointTitle} numberOfLines={2}>
            {waypoint.title}
          </Text>
          <Text style={styles.waypointDistance}>
            {distance}
          </Text>
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
                      size={16} 
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
                    <Ionicons name="stop" size={16} color="#fff" />
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={() => playAudio(waypoint.description, waypoint.id, waypoint.audioUrl || waypoint.audioFile)}
                  disabled={audioLoading}
                >
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={styles.playButtonText}>
                    {audioLoading ? "Loading..." : "Play Audio"}
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

      setPlayingId(id);
      setPaused(false);
      setAudioLoading(true);

      // Find the waypoint to get the correct audio URL
      const waypoint = waypoints.find(wp => wp.id === id);
      const audioUrl = waypoint?.audioUrl || waypoint?.audioFile || audioFile;

      // Try to play audio file first, fallback to TTS
      if (audioUrl) {
        try {
          console.log('Loading audio file:', audioUrl);
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: true }
          );
          soundRef.current = sound;
          
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
              setAudioLoading(false);
              if (status.didJustFinish) {
                setPlayingId(null);
                setPaused(false);
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
        Speech.speak(textContent);
        setAudioLoading(false);
        console.log('Playing TTS for waypoint:', id);
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
      console.log('Audio stopped');
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
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map, userMarker;
            const waypoints = ${JSON.stringify(waypointsData)};
            const userLocation = ${userLocation ? JSON.stringify({lat: userLocation.latitude, lng: userLocation.longitude}) : 'null'};
            
            function initMap() {
              try {
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

                console.log('Map initialized with', waypoints.length, 'waypoints');
              } catch (err) {
                console.error('Map error:', err);
                document.getElementById('map').innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Map loading error. Please try again.</div>';
              }
            }

            // Update user location
            function updateUserLocation(lat, lng) {
              if (userMarker) {
                userMarker.setPosition({ lat: lat, lng: lng });
                map.setCenter({ lat: lat, lng: lng });
              }
            }

            // Expose function to parent
            window.updateUserLocation = updateUserLocation;
          </script>
          <script
            src="https://maps.googleapis.com/maps/api/js?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDNSVtipo7FnM0W7xrlqERCRLUki-xclsU'}&callback=initMap"
            async
            defer></script>
        </body>
      </html>
    `;
  };

  if (loading) return (
    <View style={styles.safeArea}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#2c5aa0" />
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
          <View style={styles.headerLeft}>
            <CuriousRoadLogo size="small" showText={false} />
            <Text style={styles.headerTitle}>Curious Road</Text>
            {approachingWaypoint && (
              <View style={styles.approachingBadge}>
                <Ionicons name="location" size={10} color="#fff" />
                <Text style={styles.approachingText}>Near</Text>
              </View>
            )}
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshWaypoints}>
              <Ionicons name="refresh" size={22} color="#2c5aa0" />
            </TouchableOpacity>
            {playingId && (
              <TouchableOpacity style={styles.stopAllButton} onPress={stopAudio}>
                <Ionicons name="stop" size={22} color="#dc3545" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.tripButton} 
              onPress={() => setTripActive(!tripActive)}
            >
              <Ionicons 
                name={tripActive ? "pause" : "play"} 
                size={18} 
                color="#2c5aa0" 
              />
              <Text style={styles.tripButtonText}>
                {tripActive ? "Stop" : "Start"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapToggle} 
              onPress={() => setShowMap(!showMap)}
            >
              <Ionicons 
                name={showMap ? "list" : "map"} 
                size={20} 
                color="#2c5aa0" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {showMap ? (
          <View style={styles.mapContainer}>
            <WebView
              ref={mapWebViewRef}
              source={{ html: createMapHTML() }}
              style={styles.mapView}
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
      </View>
    </View>
  );
} 