import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import CuriousRoadLogo from '../../components/CuriousRoadLogo';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { notificationService } from '../../services/notificationService.js';

export default function SettingsScreen() {
  // Temporarily use local state instead of context
  const [settings, setSettings] = useState({
    notificationMode: 'notification' as 'autoplay' | 'notification',
    notificationsEnabled: false,
    backgroundLocationEnabled: true, // Changed default to true
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [noRepeatStories, setNoRepeatStories] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      paddingTop: 24,
      backgroundColor: '#FDFBF7',
      borderBottomWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      marginRight: 8
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#2E5A3D',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
      letterSpacing: -0.5,
    },
    content: {
      flex: 1,
      backgroundColor: '#FDFBF7',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      paddingTop: 12
    },
    section: {
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
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#2E2E2E',
      marginBottom: 20,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
      letterSpacing: -0.3,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    settingItemLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    settingInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    settingIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#F8F6F0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: '#E0D8C8',
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2E2E2E',
      marginBottom: 6,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    settingDescription: {
      fontSize: 15,
      color: '#666666',
      lineHeight: 22,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    settingControl: {
      alignItems: 'flex-end',
    },
    // Redesigned approach behavior section
    approachBehaviorContainer: {
      marginTop: 12,
    },
    approachBehaviorDescription: {
      fontSize: 15,
      color: '#666666',
      lineHeight: 22,
      marginBottom: 20,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    modeToggleContainer: {
      backgroundColor: '#F8F6F0',
      borderRadius: 16,
      padding: 6,
      borderWidth: 1,
      borderColor: '#E0D8C8',
    },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      borderRadius: 12,
    },
    modeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      gap: 10,
    },
    modeButtonActive: {
      backgroundColor: '#2E5A3D',
      shadowColor: '#2E5A3D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    modeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#666666',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    modeButtonTextActive: {
      color: '#fff',
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8F6F0',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginVertical: 8,
      gap: 10,
      borderWidth: 1,
      borderColor: '#E0D8C8',
    },
    testButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2E5A3D',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    infoItemLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    infoLabel: {
      fontSize: 16,
      color: '#2E2E2E',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 16,
      color: '#666666',
      fontWeight: '500',
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    },
  });

  useEffect(() => {
    checkNotificationPermissions();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const noRepeatData = await AsyncStorage.getItem('noRepeatStories');
      if (noRepeatData) {
        setNoRepeatStories(JSON.parse(noRepeatData));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
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
      await AsyncStorage.removeItem('listenedWaypoints');
      Alert.alert('Success', 'Listening history cleared!');
    } catch (error) {
      console.error('Error clearing history:', error);
      Alert.alert('Error', 'Failed to clear history');
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const notificationSettings = await notificationService.getNotificationSettings();
      setNotificationsEnabled(notificationSettings.granted);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const handleNotificationModeChange = (mode: 'autoplay' | 'notification') => {
    console.log('Changing notification mode to:', mode);
    setSettings(prev => ({ ...prev, notificationMode: mode }));
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const granted = await notificationService.requestPermissions();
      setNotificationsEnabled(granted);
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive waypoint alerts.',
          [{ text: 'OK' }]
        );
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleBackgroundLocationToggle = (value: boolean) => {
    setSettings(prev => ({ ...prev, backgroundLocationEnabled: value }));
  };

  const handleSoundToggle = (value: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: value }));
  };

  const handleVibrationToggle = (value: boolean) => {
    setSettings(prev => ({ ...prev, vibrationEnabled: value }));
  };

  const testNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const renderSettingItem = (
    title: string,
    description: string,
    control: React.ReactNode,
    icon?: string,
    isLast: boolean = false
  ) => (
    <View style={[styles.settingItem, isLast && styles.settingItemLast]}>
      <View style={styles.settingInfo}>
                  {icon && (
            <View style={styles.settingIcon}>
              <Ionicons name={icon as any} size={20} color="#2E5A3D" />
            </View>
          )}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.settingControl}>
        {control}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <CuriousRoadLogo size="small" showText={false} />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {/* Notification Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            {/* Approach Behavior - Redesigned */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Ionicons name="notifications" size={20} color="#2c5aa0" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Approach Behavior</Text>
                  <Text style={styles.settingDescription}>
                    Choose how the app handles approaching waypoints
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.approachBehaviorContainer}>
              <Text style={styles.approachBehaviorDescription}>
                When you're approaching a waypoint, the app can either alert you with a notification or automatically start playing the audio content.{'\n\n'}
                <Text style={{ fontWeight: '600', color: '#2E5A3D' }}>Note:</Text> Waypoint detection is automatically paused while you're listening to a story to avoid interruptions.{'\n\n'}
                <Text style={{ fontWeight: '600', color: '#8B4513' }}>Trip Start:</Text> When you start a trip, there's a 30-second delay before notifications begin to allow you to get settled.
              </Text>
              
              <View style={styles.modeToggleContainer}>
                <View style={styles.modeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      settings.notificationMode === 'notification' && styles.modeButtonActive
                    ]}
                    onPress={() => handleNotificationModeChange('notification')}
                  >
                    <Ionicons 
                      name="notifications" 
                      size={18} 
                      color={settings.notificationMode === 'notification' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.modeButtonText,
                      settings.notificationMode === 'notification' && styles.modeButtonTextActive
                    ]}>
                      Alert Me
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      settings.notificationMode === 'autoplay' && styles.modeButtonActive
                    ]}
                    onPress={() => handleNotificationModeChange('autoplay')}
                  >
                    <Ionicons 
                      name="play" 
                      size={18} 
                      color={settings.notificationMode === 'autoplay' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.modeButtonText,
                      settings.notificationMode === 'autoplay' && styles.modeButtonTextActive
                    ]}>
                      Auto-play
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {renderSettingItem(
              'Push Notifications',
              'Receive notifications for nearby waypoints',
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#E0D8C8', true: '#2E5A3D' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />,
              'phone-portrait'
            )}

            {renderSettingItem(
              'Sound',
              'Play audio alerts and waypoint content',
              <Switch
                value={settings.soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: '#E0D8C8', true: '#2E5A3D' }}
                thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
              />,
              'musical-notes'
            )}

            {renderSettingItem(
              'Vibration',
              'Vibrate when receiving notifications',
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={handleVibrationToggle}
                trackColor={{ false: '#E0D8C8', true: '#2E5A3D' }}
                thumbColor={settings.vibrationEnabled ? '#fff' : '#f4f3f4'}
              />,
              'phone-portrait',
              true
            )}
          </View>

          {/* Car Safety Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Car Safety</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Ionicons name="car" size={20} color="#2c5aa0" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Driving Mode</Text>
                  <Text style={styles.settingDescription}>
                    Optimize the app for safe driving. Audio will automatically pause for navigation alerts and emergency sounds.
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Ionicons name="volume-high" size={20} color="#2c5aa0" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Audio Safety</Text>
                  <Text style={styles.settingDescription}>
                    Stories automatically pause for navigation directions and emergency alerts. Background audio continues when app is closed.
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Ionicons name="notifications-off" size={20} color="#2c5aa0" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Non-Intrusive Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Notifications don't require immediate interaction. Stories play automatically or wait for your tap.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            {renderSettingItem(
              'Background Location',
              'Get waypoint alerts even when using other apps (like GPS)',
              <Switch
                value={settings.backgroundLocationEnabled}
                onValueChange={handleBackgroundLocationToggle}
                trackColor={{ false: '#E0D8C8', true: '#2E5A3D' }}
                thumbColor={settings.backgroundLocationEnabled ? '#fff' : '#f4f3f4'}
              />,
              'location'
            )}

            {renderSettingItem(
              'No Repeat Stories',
              'Only play each story once during your trip',
              <Switch
                value={noRepeatStories}
                onValueChange={toggleNoRepeatStories}
                trackColor={{ false: '#E0D8C8', true: '#2E5A3D' }}
                thumbColor={noRepeatStories ? '#fff' : '#f4f3f4'}
              />,
              'repeat',
              true
            )}
          </View>

          {/* Testing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Testing</Text>
            
            <TouchableOpacity style={styles.testButton} onPress={testNotification}>
              <Ionicons name="send" size={20} color="#2E5A3D" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.testButton, { marginTop: 8 }]} 
              onPress={() => {
                console.log('Current settings:', settings);
                Alert.alert('Settings', `Current mode: ${settings.notificationMode}`);
              }}
            >
              <Ionicons name="information-circle" size={20} color="#2E5A3D" />
              <Text style={styles.testButtonText}>Show Current Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.testButton, { marginTop: 8 }]} 
              onPress={clearListenedHistory}
            >
              <Ionicons name="trash" size={20} color="#2E5A3D" />
              <Text style={styles.testButtonText}>Clear Listening History</Text>
            </TouchableOpacity>
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.1.0</Text>
            </View>
            
            <View style={[styles.infoItem, styles.infoItemLast]}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>Development</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 