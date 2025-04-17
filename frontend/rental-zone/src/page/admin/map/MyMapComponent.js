import React, { useEffect } from "react";
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";

const MapComponent = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=AIzaSyDvF2YFxTxLRUxDRvtkISAma8qICwwsAIY&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap
)((props) => (
  <GoogleMap defaultZoom={8} defaultCenter={{ lat: 21.0302655 , lng: 105.7846598 }}>
    {props.isMarkerShown && (
      <Marker position={{ lat: 21.0302655 , lng: 105.7846598 }} />
    )}
  </GoogleMap>
));

const Map = ({ longitude, latitude }) => {
  console.log("Lat", latitude, longitude);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDvF2YFxTxLRUxDRvtkISAma8qICwwsAIY&v=3.exp&libraries=geometry,drawing,places`;
    script.async = true;
    script.defer = true;

    const handleScriptError = () => {
      console.error("Error loading Google Maps script.");
    };

    script.addEventListener("error", handleScriptError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener("error", handleScriptError);
      document.body.removeChild(script);
    };
  }, []);

  if (!longitude || !latitude) {
    return <div>Error: Invalid latitude or longitude.</div>;
  }

  return <MapComponent isMarkerShown latitude={longitude} longitude={latitude} />;
};

export default Map;