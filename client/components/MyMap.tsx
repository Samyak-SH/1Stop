import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Region,
  Polyline,
  Marker,
} from "react-native-maps";
import * as Location from "expo-location";

// Google Places API key - should be stored in environment variables in production
const GOOGLE_DIRECTIONS_API_KEY = "AIzaSyAztjOUm6z678zPUAWdsT9CpatrfQwSAy8";

export type MyMapRef = {
  locateMe: () => Promise<boolean>;
  findRoute: (
    originPlace: string,
    destinationPlace: string
  ) => Promise<{
    distance: string;
    duration: string;
    routeCoordinates: { latitude: number; longitude: number }[];
  } | null>;
};

type RouteInfo = {
  distance: string;
  duration: string;
};

const MyMap = forwardRef<MyMapRef, {}>((props, ref) => {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [isLocating, setIsLocating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [markers, setMarkers] = useState<
    { latitude: number; longitude: number }[]
  >([]);

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

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
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

  // Function to get place coordinates by address/place name
  const getPlaceCoordinates = async (
    placeName: string
  ): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          placeName
        )}&key=${GOOGLE_DIRECTIONS_API_KEY}`
      );
      const data = await response.json();
      // console.log(data.status, data.results);
      if (data.status === "OK" && data.results && data.results.length > 0) {
        return data.results[0].geometry.location;
      }
      return null;
    } catch (error) {
      console.error("Error geocoding place:", error);
      return null;
    }
  };

  // Function to decode Google's polyline format
  const decodePolyline = (
    encoded: string
  ): { latitude: number; longitude: number }[] => {
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;
    const coordinates = [];

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      coordinates.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return coordinates;
  };

  useImperativeHandle(ref, () => ({
    locateMe: async () => {
      setIsLocating(true);
      const newRegion = await getCurrentLocation();

      if (newRegion) {
        setUserLocation(newRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 500);
        }
      }

      setIsLocating(false);
      return !!newRegion;
    },

    findRoute: async (originPlace: string, destinationPlace: string) => {
      try {
        // Get coordinates for origin and destination
        const originCoords = await getPlaceCoordinates(originPlace);
        const destCoords = await getPlaceCoordinates(destinationPlace);

        if (!originCoords || !destCoords) {
          Alert.alert(
            "Location Error",
            "Could not find coordinates for the specified locations."
          );
          return null;
        }

        // Set markers for origin and destination
        const newMarkers = [
          { latitude: originCoords.lat, longitude: originCoords.lng },
          { latitude: destCoords.lat, longitude: destCoords.lng },
        ];
        setMarkers(newMarkers);

        // Fetch directions from Google Directions API with transit mode set to bus
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${originCoords.lat},${originCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&mode=transit&transit_mode=bus&key=${GOOGLE_DIRECTIONS_API_KEY}`
        );

        const data = await response.json();

        if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
          Alert.alert(
            "Route Error",
            `No transit routes found. Status: ${data.status}`
          );
          return null;
        }

        // Extract route information
        const route = data.routes[0];
        const leg = route.legs[0];

        // Extract distance and duration
        const distance = leg.distance.text;
        const duration = leg.duration.text;

        // Extract encoded polyline and decode it
        const polyline = route.overview_polyline.points;
        const decodedCoords = decodePolyline(polyline);

        // Update state
        setRouteCoords(decodedCoords);
        setRouteInfo({ distance, duration });

        // Fit the map to show the entire route
        if (mapRef.current && decodedCoords.length > 0) {
          mapRef.current.fitToCoordinates(decodedCoords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }

        return {
          distance,
          duration,
          routeCoordinates: decodedCoords,
        };
      } catch (error) {
        console.error("Error finding route:", error);
        Alert.alert("Route Error", "Failed to calculate route.");
        return null;
      }
    },
  }));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={
          userLocation || {
            latitude: 12.9716,
            longitude: 77.5946,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        }
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor="#22c55e"
          />
        )}

        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            pinColor={index === 0 ? "#22c55e" : "#0000ff"}
          />
        ))}
      </MapView>

      {isLocating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  map: { flex: 1 },
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
