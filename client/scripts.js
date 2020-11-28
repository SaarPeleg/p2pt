var map;
$(document).ready(function () {
  var geojson;

  var ctx = document.getElementById('plotHistory');
  var plotHistory = new Chart(ctx, {
    type: 'line',
    data:
    {
      datasets: [{
        label:"avocado",
        borderColor: 'green',
        showLine: true,
        fill: false,
        data:[10,20,30,40,50,60]
      },
      {
        label:"banana",
        borderColor: 'yellow',
        showLine: true,
        fill: false,
        data:[10,25,5,17,80,50]
      },
      {
        label:"orange",
        borderColor: 'orange',
        showLine: true,
        fill: false,
        data:[50,40,30,15,50,2]
      }
    
    ],
     
      labels: ['2015', '2016', '2017', '2018', '2019', '2020']
    },
    
    options: {
      responsive: false
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'year'
        },
        scaleLabel: {
          display: true,
          labelString: 'Date'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]
    }
  }
  
  );
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
    console.log("data", map.data);
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
    };
  });
  
}
