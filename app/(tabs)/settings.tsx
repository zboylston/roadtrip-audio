import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { notificationService } from '../../services/notificationService.js';

export default function SettingsScreen() {
  // Temporarily use local state instead of context
  const [settings, setSettings] = useState({
    notificationMode: 'notification' as 'autoplay' | 'notification',
    autoPlayEnabled: true,
    notificationsEnabled: false,
    backgroundLocationEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.curiousCream,
    },
    header: {
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.curiousBorder,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.curiousGreen,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.surface,
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.curiousText,
      marginBottom: 16,
      marginTop: 8,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.curiousBorder,
    },
    settingInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    settingIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.curiousWarm,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.curiousText,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.curiousTextSecondary,
      lineHeight: 20,
    },
    settingControl: {
      alignItems: 'flex-end',
    },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: colors.curiousWarm,
      borderRadius: 20,
      padding: 4,
    },
    modeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      gap: 6,
    },
    modeButtonActive: {
      backgroundColor: colors.curiousGreen,
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.curiousTextSecondary,
    },
    modeButtonTextActive: {
      color: '#fff',
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.curiousWarm,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginVertical: 8,
      gap: 8,
    },
    testButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.curiousGreen,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.curiousBorder,
    },
    infoLabel: {
      fontSize: 16,
      color: colors.curiousText,
    },
    infoValue: {
      fontSize: 16,
      color: colors.curiousTextSecondary,
      fontWeight: '500',
    },
  });

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      const notificationSettings = await notificationService.getNotificationSettings();
      setNotificationsEnabled(notificationSettings.granted);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const handleNotificationModeChange = (mode: 'autoplay' | 'notification') => {
    setSettings(prev => ({ ...prev, notificationMode: mode }));
  };

  const handleAutoPlayToggle = (value: boolean) => {
    setSettings(prev => ({ ...prev, autoPlayEnabled: value }));
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
    icon?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        {icon && (
          <View style={styles.settingIcon}>
            <Ionicons name={icon as any} size={20} color="#007AFF" />
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSettingItem(
            'Notification Mode',
            'Choose how the app handles approaching waypoints',
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
                  size={16} 
                  color={settings.notificationMode === 'notification' ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.modeButtonText,
                  settings.notificationMode === 'notification' && styles.modeButtonTextActive
                ]}>
                  Notify
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
                  size={16} 
                  color={settings.notificationMode === 'autoplay' ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.modeButtonText,
                  settings.notificationMode === 'autoplay' && styles.modeButtonTextActive
                ]}>
                  Auto-play
                </Text>
              </TouchableOpacity>
            </View>,
            'notifications'
          )}

          {renderSettingItem(
            'Push Notifications',
            'Receive notifications for nearby waypoints',
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />,
            'phone-portrait'
          )}

          {renderSettingItem(
            'Auto-play Audio',
            'Automatically play waypoint content when approaching',
            <Switch
              value={settings.autoPlayEnabled}
              onValueChange={handleAutoPlayToggle}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor={settings.autoPlayEnabled ? '#fff' : '#f4f3f4'}
            />,
            'volume-high'
          )}

          {renderSettingItem(
            'Sound',
            'Play audio alerts and waypoint content',
            <Switch
              value={settings.soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
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
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor={settings.vibrationEnabled ? '#fff' : '#f4f3f4'}
            />,
            'phone-portrait'
          )}
        </View>

        {/* Location Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          {renderSettingItem(
            'Background Location',
            'Track location even when app is in background',
            <Switch
              value={settings.backgroundLocationEnabled}
              onValueChange={handleBackgroundLocationToggle}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor={settings.backgroundLocationEnabled ? '#fff' : '#f4f3f4'}
            />,
            'location'
          )}
        </View>

        {/* Testing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={testNotification}>
            <Ionicons name="send" size={20} color="#007AFF" />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.1.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>Development</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 