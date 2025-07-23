import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface CuriousRoadLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function CuriousRoadLogo({ size = 'medium', showText = true }: CuriousRoadLogoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getSize = () => {
    switch (size) {
      case 'small': return { logo: 24, text: 12 };
      case 'large': return { logo: 48, text: 20 };
      default: return { logo: 32, text: 16 };
    }
  };

  const { logo, text } = getSize();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      width: logo,
      height: logo,
      borderRadius: logo / 2,
      backgroundColor: colors.curiousOrange,
      borderWidth: 2,
      borderColor: colors.curiousGreen,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: showText ? 4 : 0,
    },
    questionMark: {
      color: colors.curiousGreen,
      fontSize: logo * 0.4,
      fontWeight: 'bold',
    },
    text: {
      color: colors.curiousGreen,
      fontSize: text,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.questionMark}>?</Text>
      </View>
      {showText && (
        <Text style={styles.text}>Curious Road</Text>
      )}
    </View>
  );
} 