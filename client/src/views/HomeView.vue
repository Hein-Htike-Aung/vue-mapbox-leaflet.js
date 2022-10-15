<template>
  <div class="h-screen relative">
    <GeoErrorModal
      @closeGeoError="closeGeoError"
      v-if="geoError"
      :geoErrorMsg="geoErrorMsg"
    />
    <MapFeatures
      :coords="coords"
      :fetchCoords="fetchCoords"
      :searchResults="searchResults"
      @getGeoLocation="getGeoLocation"
      @plotResult="plotResult"
      @removeResult="removeResult"
      @toggleSearchResults="toggleSearchResults"
    />
    <div id="map" class="h-full z-0 z-[1]"></div>
  </div>
</template>

<script>
import leaflet from "leaflet";
import { onMounted, ref } from "vue";
import GeoErrorModal from "@/components/GeoErrorModal.vue";
import MapFeatures from "@/components/MapFeatures.vue";

export default {
  name: "HomeView",
  components: {
    GeoErrorModal,
    MapFeatures,
  },
  setup() {
    let map;

    onMounted(() => {
      map = leaflet
        .map("map")
        .setView([16.809899260616387, 96.13063614292287], 15);

      // add tile layer
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map);

      map.on("moveend", () => {
        closeSearchResults();
      });

      getGeoLocation();
    });

    const coords = ref(null);
    const fetchCoords = ref(null);

    const geoMarker = ref(null);
    const geoError = ref(null);
    const geoErrorMsg = ref(null);

    const getGeoLocation = () => {
      if (coords.value) {
        coords.value = null;
        sessionStorage.removeItem("coords");
        map.removeLayer(geoMarker.value);
        return;
      }
      // check session storage for coords
      if (sessionStorage.getItem("coords")) {
        coords.value = JSON.parse(sessionStorage.getItem("coords"));
        plotGeolocation(coords.value);
        return;
      }
      fetchCoords.value = true;
      navigator.geolocation.getCurrentPosition(setCoords, getLocError);
    };

    const setCoords = (pos) => {
      // stop fetching coords
      fetchCoords.value = null;

      // set coords in session storage
      const setSessionCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      sessionStorage.setItem("coords", JSON.stringify(setSessionCoords));

      // set ref coords value
      coords.value = setSessionCoords;

      plotGeolocation(coords.value);
    };

    const getLocError = (err) => {
      fetchCoords.value = null;
      geoError.value = true;
      geoErrorMsg.value = err.message;
    };

    const closeGeoError = () => {
      geoError.value = null;
      geoErrorMsg.value = null;
    };

    const plotGeolocation = (coords) => {
      // create custom marker
      const customMarker = leaflet.icon({
        iconUrl: require("../assets/map-marker-red.svg"),
        iconSize: [35, 35],
      });

      // create new marker with coords and custom icon
      geoMarker.value = leaflet
        .marker([coords.lat, coords.lng], {
          icon: customMarker,
        })
        .addTo(map);

      // set map view to current location
      map.setView([coords.lat, coords.lng], 15);
    };

    const resultMarker = ref(null);
    const plotResult = (coords) => {
      // Check to see if resultMarker has value
      if (resultMarker.value) {
        map.removeLayer(resultMarker.value);
      }

      // create custom marker
      const customMarker = leaflet.icon({
        iconUrl: require("../assets/map-marker-blue.svg"),
        iconSize: [35, 35],
      });

      // create new marker with coords and custom icon
      resultMarker.value = leaflet
        .marker([coords.coordinates[1], coords.coordinates[0]], {
          icon: customMarker,
        })
        .addTo(map);

      // set map view to current location
      map.setView([coords.coordinates[1], coords.coordinates[0]], 18);

      closeSearchResults();
    };  

    const searchResults = ref(null);
    const toggleSearchResults = () => {
      console.log("focusing on input");
      searchResults.value = !searchResults.value;
    };

    const closeSearchResults = () => {
      searchResults.value = null;
    };

    const removeResult = () => {
      map.removeLayer(resultMarker.value);
    };

    return {
      coords,
      fetchCoords,
      geoMarker,
      closeGeoError,
      geoError,
      geoErrorMsg,
      getGeoLocation,
      plotResult,
      searchResults,
      toggleSearchResults,
      closeSearchResults,
      removeResult,
    };
  },
};
</script>

<style lang=""></style>
