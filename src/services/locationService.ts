import * as Location from 'expo-location';

export interface DeviceCoords {
  latitude: number;
  longitude: number;
}

/**
 * Request foreground location permission and return the device's current
 * coordinates. Throws a user-readable message on denial or failure.
 */
export async function requestDeviceLocation(): Promise<DeviceCoords> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error(
      'Location permission was denied. You can enable it in your device settings.',
    );
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

/**
 * Turn coordinates into a human-readable city string.
 * Falls back to "lat, lon" if reverse geocoding returns nothing.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!results.length) return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    const r = results[0];
    return [r.city, r.region, r.country].filter(Boolean).join(', ');
  } catch {
    return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  }
}
