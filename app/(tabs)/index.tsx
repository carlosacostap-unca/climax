import { ThemedText } from '@/components/themed-text';
import { Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const REVERSE_GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/reverse';
const REVERSE_GEOCODING_FALLBACK_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const colors = {
  surface: '#030e22',
  surfaceContainer: '#0a1932',
  surfaceContainerHigh: '#101f3a',
  surfaceContainerHighest: '#152543',
  surfaceVariant: 'rgba(21, 37, 67, 0.6)',
  primary: '#40cef3',
  primaryContainer: '#04b5d9',
  secondary: '#65e2fc',
  tertiary: '#ffc967',
  onSurface: '#dce5ff',
  onSurfaceVariant: '#a0abc6',
  outlineVariant: 'rgba(61, 72, 95, 0.15)',
  outline: 'rgba(107, 117, 142, 0.2)',
  onPrimary: '#00414f',
  error: '#ff716c',
};

export default function WeatherScreen() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [locationName, setLocationName] = useState('Cargando...');

  const formatLocationName = (location?: {
    city?: string | null;
    locality?: string | null;
    district?: string | null;
    subregion?: string | null;
    region?: string | null;
    country?: string | null;
    isoCountryCode?: string | null;
    name?: string | null;
  }) => {
    if (!location) return null;

    const cityName =
      location.city ||
      location.locality ||
      location.district ||
      location.subregion ||
      location.region ||
      location.name;
    const countryName = location.isoCountryCode || location.country;

    if (!cityName) return null;

    return countryName ? `${cityName}, ${countryName}` : cityName;
  };

  const resolveCurrentCityName = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const deviceLocationName = formatLocationName(reverseGeocode[0]);

      if (deviceLocationName) {
        return deviceLocationName;
      }
    } catch {
      // Fall through to API-based reverse geocoding.
    }

    try {
      const response = await fetch(
        `${REVERSE_GEOCODING_API_URL}?latitude=${latitude}&longitude=${longitude}&language=es&format=json`
      );
      const data = await response.json();
      const result = data?.results?.[0];
      const apiLocationName = formatLocationName({
        city: result?.city,
        district: result?.admin3,
        subregion: result?.admin2,
        region: result?.admin1,
        country: result?.country,
        name: result?.name,
      });

      if (apiLocationName) {
        return apiLocationName;
      }
    } catch {
      // Fall through to secondary reverse geocoding provider.
    }

    try {
      const response = await fetch(
        `${REVERSE_GEOCODING_FALLBACK_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
      );
      const data = await response.json();
      const fallbackLocationName = formatLocationName({
        city: data?.city,
        locality: data?.locality,
        district: data?.principalSubdivision,
        region: data?.principalSubdivision,
        country: data?.countryName,
      });

      return fallbackLocationName || 'Ubicación Actual';
    } catch {
      return 'Ubicación Actual';
    }
  };

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility,apparent_temperature&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener el clima');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Permite el acceso a la ubicación para buscar el clima local.');
      setLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      fetchWeather(latitude, longitude);

      const resolvedLocationName = await resolveCurrentCityName(latitude, longitude);
      setLocationName(resolvedLocationName);
    } catch (error) {
      setLocationName('Ubicación Actual');
      setLoading(false);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual.');
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  if (!fontsLoaded) {
    return <View style={[styles.container, { backgroundColor: colors.surface }]} />;
  }

  const getWeatherIcon = (code: number) => {
    if (code === 0) return 'sunny';
    if (code >= 1 && code <= 3) return 'partly-sunny';
    if (code >= 45 && code <= 48) return 'cloud';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 95) return 'thunderstorm';
    return 'cloud';
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return 'Despejado';
    if (code >= 1 && code <= 3) return 'Parcialmente Nublado';
    if (code >= 45 && code <= 48) return 'Neblina';
    if (code >= 51 && code <= 67) return 'Lluvia';
    if (code >= 71 && code <= 77) return 'Nieve';
    if (code >= 95) return 'Tormenta';
    return 'Desconocido';
  };

  const isSunny = weatherData && weatherData.current.weather_code <= 3;
  const iconColor = isSunny ? colors.tertiary : colors.primary;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={24} color={colors.primary} />
          <ThemedText style={styles.locationTitle}>{locationName}</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={28} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Cargando atmósfera...</ThemedText>
          </View>
        ) : weatherData ? (
          <View style={styles.weatherWrapper}>
            
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroGlow} />
              <Ionicons 
                name={getWeatherIcon(weatherData.current.weather_code) as any} 
                size={110} 
                color={iconColor} 
                style={styles.heroIcon}
              />
              <ThemedText style={styles.heroTemp}>
                {Math.round(weatherData.current.temperature_2m)}°<ThemedText style={styles.heroTempUnit}>C</ThemedText>
              </ThemedText>
              <ThemedText style={styles.heroDesc}>
                {getWeatherDescription(weatherData.current.weather_code)} • Sensación: {Math.round(weatherData.current.apparent_temperature)}°
              </ThemedText>
              
              <View style={styles.highLowContainer}>
                <View style={styles.highLowPill}>
                  <Ionicons name="arrow-up" size={16} color={colors.error} />
                  <ThemedText style={styles.highLowText}>
                    H: {Math.round(weatherData.daily.temperature_2m_max[0])}°
                  </ThemedText>
                </View>
                <View style={styles.highLowPill}>
                  <Ionicons name="arrow-down" size={16} color={colors.secondary} />
                  <ThemedText style={styles.highLowText}>
                    L: {Math.round(weatherData.daily.temperature_2m_min[0])}°
                  </ThemedText>
                </View>
              </View>
            </View>
            
            {/* Glass Card */}
            <BlurView intensity={32} tint="dark" style={styles.glassCard}>
              <View style={styles.glassOverlay} />
              
              {/* Detail Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.detailHeader}>
                    <Ionicons name="water" size={18} color={colors.onSurfaceVariant} />
                    <ThemedText style={styles.detailLabel}>HUMEDAD</ThemedText>
                  </View>
                  <ThemedText style={styles.detailValue}>{weatherData.current.relative_humidity_2m}%</ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailHeader}>
                    <Ionicons name="navigate" size={18} color={colors.onSurfaceVariant} />
                    <ThemedText style={styles.detailLabel}>VIENTO</ThemedText>
                  </View>
                  <ThemedText style={styles.detailValue}>
                    {weatherData.current.wind_speed_10m} <ThemedText style={styles.detailUnit}>km/h</ThemedText>
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailHeader}>
                    <Ionicons name="eye" size={18} color={colors.onSurfaceVariant} />
                    <ThemedText style={styles.detailLabel}>VISIBILIDAD</ThemedText>
                  </View>
                  <ThemedText style={styles.detailValue}>
                    {((weatherData.current.visibility || 10000)/1000).toFixed(0)} <ThemedText style={styles.detailUnit}>km</ThemedText>
                  </ThemedText>
                </View>
              </View>

              {/* Hourly Strip */}
              <View style={styles.hourlyDivider} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyContainer}>
                <View style={styles.hourlyItem}>
                  <ThemedText style={styles.hourlyTime}>Ahora</ThemedText>
                  <Ionicons name={getWeatherIcon(weatherData.current.weather_code) as any} size={28} color={colors.primary} />
                  <ThemedText style={styles.hourlyTemp}>{Math.round(weatherData.current.temperature_2m)}°</ThemedText>
                </View>
                {[1, 2, 3, 4, 5].map((offset) => {
                  const hourTemp = weatherData.hourly.temperature_2m[offset];
                  const hourCode = weatherData.hourly.weather_code[offset];
                  const hourIcon = getWeatherIcon(hourCode);
                  const isSunnyHour = hourCode <= 3;
                  const hourColor = isSunnyHour ? colors.tertiary : colors.onSurfaceVariant;
                  
                  return (
                    <View key={offset} style={[styles.hourlyItem, { opacity: 0.8 }]}>
                      <ThemedText style={styles.hourlyTime}>+{offset}h</ThemedText>
                      <Ionicons name={hourIcon as any} size={28} color={hourColor} />
                      <ThemedText style={styles.hourlyTemp}>{Math.round(hourTemp)}°</ThemedText>
                    </View>
                  );
                })}
              </ScrollView>
            </BlurView>
            
            {/* Bento Widgets */}
            <View style={styles.bentoGrid}>
              <View style={styles.bentoWidget}>
                <View style={styles.mapOverlay} />
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyBaON49ea9gGmiX_1fHBhCkW0coHQgl5TLO-GAb6KOb1KnuzjplvsCNTXdfC6y3mftu6m3NVG7sLNEDsHmSxPLsIXFfrxzQQB_hMuz9p9v0ym8yz-PCInc6OaPpaz1AzNm7ObTgevHWQqVpQ9s-D88zWTCfXoy-PsCdALTELEyFuyIjVqi_gJIn86g_oj7Vr_TXuVOjkey7BsHkoXIooCtWNpJjWTkV6eWFGb8326MFRUaWfql9I3gY4ey5DzbIZZ4HLNc8HVm4Q' }} 
                  style={styles.mapImage}
                  contentFit="cover"
                />
                <View style={styles.widgetContent}>
                  <View style={styles.widgetHeaderRow}>
                    <ThemedText style={styles.widgetTitle}>Mapa (Radar)</ThemedText>
                    <Ionicons name="map-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.radarButton}>
                    <ThemedText style={styles.radarButtonText}>Ver Radar</ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.bentoWidgetAQI}>
                <View style={styles.widgetHeaderRow}>
                  <View>
                    <ThemedText style={styles.detailLabel}>CALIDAD DEL AIRE</ThemedText>
                    <ThemedText style={styles.widgetTitle}>Excelente (24)</ThemedText>
                  </View>
                  <Ionicons name="leaf-outline" size={20} color={colors.secondary} />
                </View>
                <View style={styles.aqiBarFull}>
                  <View style={styles.aqiBarFill} />
                </View>
                <ThemedText style={styles.aqiDesc}>
                  La calidad del aire es excelente. Un buen día para salir a caminar.
                </ThemedText>
              </View>
            </View>

          </View>
        ) : (
          <View style={styles.center}>
            <ThemedText style={{ color: colors.onSurface, fontFamily: 'Inter_400Regular' }}>Error al cargar los datos</ThemedText>
            <TouchableOpacity activeOpacity={0.8} onPress={getLocation} style={{ marginTop: 20 }}>
                <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.primaryButton}>
                  <ThemedText style={styles.primaryButtonText}>Reintentar</ThemedText>
                </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 50,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    color: '#f1f5f9', // slate-100
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  weatherWrapper: {
    gap: 32, // Breathing zones
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: colors.primary,
    borderRadius: 9999,
    opacity: 0.15,
    top: 20,
    transform: [{ scale: 1.5 }],
  },
  heroIcon: {
    marginBottom: 8,
  },
  heroTemp: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 100, // Hero display
    letterSpacing: -3,
    color: colors.primary,
    lineHeight: 110,
    textShadowColor: 'rgba(64, 206, 243, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  },
  heroTempUnit: {
    fontSize: 60,
  },
  heroDesc: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 20,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  highLowContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  highLowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9999,
    gap: 8,
  },
  highLowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.onSurface,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 10,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceVariant,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  detailItem: {
    flex: 1,
    gap: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5, // uppercase tracking-widest
  },
  detailValue: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    color: colors.onSurface,
  },
  detailUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  hourlyDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  hourlyContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 32,
  },
  hourlyItem: {
    alignItems: 'center',
    gap: 12,
  },
  hourlyTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  hourlyTemp: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: colors.onSurface,
  },
  bentoGrid: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
  },
  bentoWidget: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 24, // xl radius
    height: 190,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // slate-900/40
    zIndex: 10,
  },
  widgetContent: {
    position: 'relative',
    zIndex: 20,
    padding: 24,
    height: '100%',
    justifyContent: 'space-between',
  },
  widgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  widgetTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: colors.onSurface,
  },
  radarButton: {
    backgroundColor: 'rgba(64, 206, 243, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  radarButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.primary,
  },
  bentoWidgetAQI: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 24,
    padding: 24,
    height: 190,
    justifyContent: 'space-between',
  },
  aqiBarFull: {
    height: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 9999,
    overflow: 'hidden',
    marginVertical: 12,
  },
  aqiBarFill: {
    height: '100%',
    width: '25%',
    backgroundColor: colors.secondary,
    borderRadius: 9999,
  },
  aqiDesc: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 9999,
  },
  primaryButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    color: colors.onPrimary,
    fontSize: 16,
  },
});
