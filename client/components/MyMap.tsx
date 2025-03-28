import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";

export type MyMapRef = {
  locateMe: () => Promise<boolean>;
};

const MyMap = forwardRef<MyMapRef, {}>((props, ref) => {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [followUserLocation, setFollowUserLocation] = useState(true);

  const defaultRegion: Region = {
    latitude: 12.9716, // Bangalore
    longitude: 77.5946,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const getCurrentLocation = async (): Promise<Region | null> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Enable location access in settings."
          );
          return null;
        }
      }

      // Use high accuracy and timeout options
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        mayShowUserSettingsDialog: true,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Location Error", "Could not get your current location.");
      return null;
    }
  };

  // Initial location setup
  useEffect(() => {
    let isMounted = true;

    const getInitialLocation = async () => {
      setIsLocating(true);
      const newRegion = await getCurrentLocation();

      if (isMounted && newRegion) {
        setUserLocation(newRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }

      if (isMounted) {
        setIsLocating(false);
      }
    };

    getInitialLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    locateMe: async () => {
      console.log("Locate Me Pressed 🚀");
      setIsLocating(true);

      try {
        const newRegion = await getCurrentLocation();

        if (newRegion) {
          setUserLocation(newRegion);
          setFollowUserLocation(true);

          // Ensure map is valid before animating
          if (mapRef.current) {
            // Use a slight delay to ensure the animation runs properly
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 500);
              }
            }, 100);
          }

          setIsLocating(false);
          return true;
        }
      } catch (error) {
        console.error("Error in locateMe:", error);
      }

      setIsLocating(false);
      return false;
    },
  }));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={userLocation || defaultRegion}
        onRegionChangeComplete={() => setFollowUserLocation(false)}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        followsUserLocation={followUserLocation}
      />

      {isLocating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 10,
    padding: 10,
  },
});

export default MyMap;
