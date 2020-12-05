var map;
var locationdata;
var toshow="";
var lang;
$(document).ready(function () {
  var geojson;
  
  var arryOfPlotDatasets = [];
  var datasetAll;
  var settings = {
    "url": "http://localhost:3000/apigetplotdata?userId=0",
    "method": "GET",
    "timeout": 0,
    "async": false,
  };

  $.ajax(settings).done(function (response) {
    console.log(response);
    var plotChartData = response.response;
    var template = $('#myplots-template').html();
    var templateScript = Handlebars.compile(template);
    var html = templateScript(plotChartData);
    $("#PlotList").append(html);
    $("li").on("click", function () {
      $(this).children().last().slideToggle(200);
      toshow=$(this).children().first()[0].text.trim();
      if(toshow=="כללי"){
        map.setCenter(lang)    
        map.setZoom(10);
      }else{
        for (let i = 0; i < locationdata.plotsJson.features.length; i++) {
          const coords = locationdata.plotsJson.features[i].geometry.coordinates;
          //console.log("coords", coords[0][1][0]);
          
          if(locationdata.plotsJson.features[i].properties.name.trim()==toshow){
            //console.log("asd")
            const latLng = new google.maps.LatLng(coords[0][0][1], coords[0][0][0]);
            map.setCenter(latLng)
            map.setZoom(14);
            break;
          }
           
          /*new google.maps.Marker({
            position: latLng,
            map: map,
          });*/
        };
      }
      
      //console.log(toshow);
    });
    $("li canvas").click(function (e) {
      e.stopPropagation();
    });
    var ctx = document.getElementById("plotHistory");
    var plotHistory = new Chart(ctx, {
      type: 'line',
      data:
      {
        datasets: response.general.dataarray,

        labels: response.years
      },

      options: {
        responsive: true
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
    for (var i = 0; i < plotChartData.length; i++) {
      var ctx = document.getElementById(plotChartData[i].name);
      var plotHistory = new Chart(ctx, {
        type: 'line',
        data:
        {
          datasets: plotChartData[i].dataarray,

          labels: response.years
        },

        options: {
          responsive: true
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

    }
  })



  //var ctx = document.getElementById('plotHistory');

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
    url: "http://localhost:3000/apilogin?userId=0",
    method: "GET",
    timeout: 0,
  };
  $.ajax(settings).done(function (response) {
    console.log(response);
    locationdata=response;
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 8,
      center: israel,
    });
    map.data.addGeoJson(response.plotsJson);
    map.data.setStyle(function (feature) {
      var color = 'red';
      if (feature.getProperty('isColorful')) {
        color = feature.getProperty('color');
      }
      return ({
        fillColor: color,
        strokeColor: color,
        strokeWeight: 2
      });
    });
    console.log("data", map.data);
    for (let i = 0; i < response.plotsJson.features.length; i++) {
      const coords = response.plotsJson.features[i].geometry.coordinates;
      console.log("coords", coords[0][1][0]);
      const latLng = new google.maps.LatLng(coords[0][0][1], coords[0][0][0]);
      lang=latLng;
      map.center = latLng;
      map.zoom = 10;
      /*new google.maps.Marker({
        position: latLng,
        map: map,
      });*/
    };


    /*map.data.addListener("click", (event) => {
      document.getElementById("PlotPage").textContent = event.feature.getProperty(
        "name"
      );
    });*/
  });

}


