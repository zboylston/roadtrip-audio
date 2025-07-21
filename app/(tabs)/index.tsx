import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../../firebaseConfig';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // meters
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

export default function WaypointsScreen() {
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [tripActive, setTripActive] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    async function fetchWaypoints() {
      try {
        const querySnapshot = await getDocs(collection(db, 'waypoints'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWaypoints(data);
      } catch (e) {
        console.error('Error fetching waypoints:', e);
      }
      setLoading(false);
    }
    fetchWaypoints();
  }, []);

  // GPS tracking
  useEffect(() => {
    let locationSub: any = null;
    if (tripActive) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        locationSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
          loc => setUserLocation(loc.coords)
        );
      })();
    } else {
      setUserLocation(null);
    }
    return () => { if (locationSub) locationSub.remove(); };
  }, [tripActive]);

  // Autoplay audio when near a waypoint (within 5 miles)
  useEffect(() => {
    if (!userLocation || !waypoints.length) return;
    for (const wp of waypoints) {
      const lat = wp.latitude;
      const lon = wp.longitude;
      const audioUrl = wp.audioUrl;
      if (lat && lon && audioUrl) {
        const dist = getDistance(userLocation.latitude, userLocation.longitude, lat, lon);
        if (dist < 8047 && playingId !== wp.id) { // 5 miles = 8047 meters
          playAudio(audioUrl, wp.id, true);
          break;
        }
      }
    }
    // eslint-disable-next-line
  }, [userLocation, waypoints]);

  const playAudio = async (url: string, id: string, auto = false) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    soundRef.current = sound;
    setPlayingId(id);
    setPaused(false);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) {
        setPlayingId(null);
        setPaused(false);
      }
    });
    if (!auto) {
      // If user-initiated, scroll to the item or give feedback if you want
    }
  };

  const pauseAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setPaused(true);
    }
  };

  const resumeAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setPaused(false);
    }
  };

  const renderWaypointCard = ({ item }: { item: any }) => {
    const dist = userLocation && item.latitude && item.longitude
      ? getDistance(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude)
      : null;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location-sharp" size={22} color="#007AFF" style={{ marginRight: 8 }} />
          <Text style={styles.title}>{item.title}</Text>
          {dist !== null && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{(dist/1609.34).toFixed(1)} mi</Text>
            </View>
          )}
        </View>
        <Text style={styles.desc} numberOfLines={3}>{item.textcontent}</Text>
        <View style={styles.cardFooter}>
          <MaterialIcons name="place" size={18} color="#888" />
          <Text style={styles.coords}>{item.latitude}, {item.longitude}</Text>
          {item.audioUrl && (
            <>
              {playingId === item.id && !paused ? (
                <TouchableOpacity style={styles.audioButton} onPress={pauseAudio}>
                  <Ionicons name="pause" size={20} color="#fff" />
                  <Text style={styles.audioButtonText}>Pause</Text>
                </TouchableOpacity>
              ) : playingId === item.id && paused ? (
                <TouchableOpacity style={styles.audioButton} onPress={resumeAudio}>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.audioButtonText}>Resume</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.audioButton} onPress={() => playAudio(item.audioUrl, item.id)}>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.audioButtonText}>Play</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  const createMapHTML = () => {
    // Limit to 20 waypoints for performance in WebView
    const limitedWaypoints = waypoints.slice(0, 20);
    const centerLat = limitedWaypoints[0]?.latitude || 35.91;
    const centerLng = limitedWaypoints[0]?.longitude || -78.86;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <style>
            html,body,#map{height:100%;margin:0;padding:0}
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            window.initMap = function () {
              try {
                const map = new google.maps.Map(document.getElementById('map'), {
                  center: {lat: ${centerLat}, lng: ${centerLng}},
                  zoom: 8
                });
                const waypoints = ${JSON.stringify(limitedWaypoints)};
                waypoints.forEach(function(wp) {
                  if (wp.latitude && wp.longitude) {
                    new google.maps.Marker({
                      position: {lat: wp.latitude, lng: wp.longitude},
                      map: map,
                      title: wp.title || 'Waypoint'
                    });
                  }
                });
                ${waypoints.length > 20 ? `
                // Add a warning marker if there are more than 20 waypoints
                new google.maps.Marker({
                  position: {lat: ${centerLat}, lng: ${centerLng}},
                  map: map,
                  title: 'Too many waypoints to display all at once!'
                });
                ` : ''}
                console.log('Map & markers loaded');
              } catch (err) {
                console.error(err);
                alert('Map error: ' + err.message);
              }
            };
          </script>
          <script
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDNSVtipo7FnM0W7xrlqERCRLUki-xclsU&callback=initMap&loading=async"
            async
            defer></script>
        </body>
      </html>
    `;
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (!waypoints.length) return <View style={styles.container}><Text>No waypoints found in Firestore.</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Waypoints</Text>
        <TouchableOpacity style={styles.tripButton} onPress={() => setTripActive(!tripActive)}>
          <Ionicons name={tripActive ? 'stop-circle' : 'play-circle'} size={28} color={tripActive ? '#FF3B30' : '#007AFF'} />
          <Text style={styles.tripButtonText}>{tripActive ? 'Stop Trip' : 'Start Trip'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapToggle} onPress={() => setShowMap(!showMap)}>
          <Ionicons name={showMap ? 'list' : 'map'} size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      {showMap ? (
        <View style={styles.mapContainer}>
          {console.log(createMapHTML())}
          <WebView
            source={{ html: createMapHTML() }}
            style={styles.mapView}
            javaScriptEnabled={true}
          />
        </View>
      ) : (
        <FlatList
          data={waypoints}
          keyExtractor={item => item.id}
          renderItem={renderWaypointCard}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  tripButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripButtonText: { fontSize: 16, color: '#007AFF', marginLeft: 4 },
  mapToggle: { marginLeft: 12 },
  mapContainer: { flex: 1, borderRadius: 18, overflow: 'hidden', margin: 16, marginTop: 0, elevation: 4, backgroundColor: '#fff' },
  mapView: { flex: 1, minHeight: 300, borderRadius: 18 },
  listContent: { paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#388E3C',
    fontWeight: '600',
    fontSize: 12,
  },
  desc: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  coords: {
    fontSize: 13,
    color: '#888',
    marginLeft: 4,
    flex: 1,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  audioButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 15,
  },
  noAudio: { color: '#888', fontStyle: 'italic' },
}); 