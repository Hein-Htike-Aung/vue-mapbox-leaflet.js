<template>
  <div class="h-screen relative">
    <GeoErrorModal
      @closeGeoError="closeGeoError "
      v-if="geoError"
      :geoErrorMsg="geoErrorMsg"
    />
    <div id="map" class="h-full z-0 z-[1]"></div>
  </div>
</template>

<script>
import leaflet from "leaflet";
import { onMounted, ref } from "vue";
import GeoErrorModal from "@/components/GeoErrorModal.vue";

export default {
  name: "HomeView",
  components: {
    GeoErrorModal,
  },
  setup() {
    let map;

    onMounted(() => {
      map = leaflet.map("map").setView([28.538336, -81.379234], 10);

      // add tile layer
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map);

      getGeoLocation();
    });

    const coords = ref(null);
    const fetchCoords = ref(null);

    const geoMarker = ref(null);
    const geoError = ref(true);
    const geoErrorMsg = ref(null);

    const getGeoLocation = () => {
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

    return {
      coords,
      geoMarker,
      closeGeoError,
      geoError,
      geoErrorMsg,
    };
  },
};
</script>

<style lang=""></style>
