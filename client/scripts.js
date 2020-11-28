var map;
$(document).ready(function () {
  var geojson;
});

function initMap() {
  // The location of Uluru
  const israel = { lat: 32.0879122, lng: 34.7272058 };
  // The map, centered at Uluru
  /*map = new google.maps.Map(document.getElementById("map"), {
    zoom: 8,
    center: israel,
  });*/
  var settings = {
    url: "http://localhost:3000/apilogin/0",
    method: "POST",
    timeout: 0,
  };
  $.ajax(settings).done(function (response) {
    console.log(response);
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 8,
      center: israel,
    });
    map.data.addGeoJson(response.plotsJson);
    for (let i = 0; i < response.plotsJson.features.length; i++) {
      const coords = response.plotsJson.features[i].geometry.coordinates;
      console.log("coords", coords[0][1][0]);
      const latLng = new google.maps.LatLng(coords[0][0][1], coords[0][0][0]);
      map.center = latLng;
      map.zoom = 10;
      new google.maps.Marker({
        position: latLng,
        map: map,
      });
    }
  });
}
