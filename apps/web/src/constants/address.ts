import { isIOS } from 'react-device-detect';
import venue from './venue.json';

export const address = venue.address;

const mapsPlaceId = venue.mapsPlaceId;
const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  'Kinó Café',
)}&destination_place_id=${mapsPlaceId}`;

const appleMapsDirectionsUrl = `https://maps.apple.com/?address=${encodeURIComponent(
  address,
)}`;

export const directionsUrl = isIOS
  ? appleMapsDirectionsUrl
  : googleMapsDirectionsUrl;
