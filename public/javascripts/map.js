$(document).ready(function(){
  function getChallengeId() {
    var currentWindowLocation = window.location.href;

    var windowLocArray = currentWindowLocation.split('/');

    var challengeIdIndex = windowLocArray.indexOf("challenge") + 1;

    return windowLocArray[challengeIdIndex];
  }

  function initializeMap(location) {
    var mapCanvas = document.getElementById('map-canvas');

    var noiseMax = .002;
    var circleRadius = 400;

    var latitude = location.latitude;
    var longitude = location.longitude;

    //Add randomness to location, so it's not always in the middle
    var randomNoise = Math.random() * noiseMax;
    latitude = Math.random() > .5 ? latitude + randomNoise : latitude - randomNoise;
    randomNoise = Math.random() * noiseMax;
    longitude = Math.random() > .5 ? longitude + randomNoise : longitude - randomNoise;


    var mapOptions = {
      center: new google.maps.LatLng(latitude, longitude),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(mapCanvas, mapOptions);

    // Construct the polygon.
    hintCircle = {
      strokeColor: '#00AA00',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#00AA00',
      fillOpacity: 0.15,
      map: map,
      center: new google.maps.LatLng(latitude, longitude),
      radius: circleRadius
    };

    //Draw circle
    var newCircle = new google.maps.Circle(hintCircle);


    var GeoMarker = new GeolocationMarker(map);

    GeoMarker.setCircleOptions({
      strokeColor: '#cccccc',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#cccccc',
      fillOpacity: 0.5
    });

    //Error handling
    GeoMarker.addListener('geolocation_error', function(error){
      if(error.code === 1){
        alert("Error getting location. Access denied.")
      }
      else if(error.code === 2){
        alert("Error getting location. Location unavailable.")
      }
      else{
        alert("Error getting location.")
      }
    });

  }

  function getChallengeLocation(challengeId) {

    var challUrl = '/challenge/'+challengeId;

    $.get(challUrl, function(data){
      initializeMap(data[0]);
    });
  }

  var challengeId = getChallengeId();

  getChallengeLocation(challengeId);

});
