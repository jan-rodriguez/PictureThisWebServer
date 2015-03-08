$(document).ready(function(){
  function getChallengeId() {
    var currentWindowLocation = window.location.href;

    var windowLocArray = currentWindowLocation.split('/');

    var challengeIdIndex = windowLocArray.indexOf("challenge") + 1;

    return windowLocArray[challengeIdIndex];
  }

  function initializeMap(location) {
    var mapCanvas = document.getElementById('map-canvas');

    var latitude = location.latitude;
    var longitude = location.longitude;



    var mapOptions = {
      center: new google.maps.LatLng(latitude, longitude),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var hintLocation;

    var map = new google.maps.Map(mapCanvas, mapOptions);

    var squareLen = .002;

    var squareCoords = [
      new google.maps.LatLng(latitude + squareLen, longitude - squareLen),
      new google.maps.LatLng(latitude + squareLen, longitude + squareLen),
      new google.maps.LatLng(latitude - squareLen, longitude + squareLen),
      new google.maps.LatLng(latitude - squareLen, longitude - squareLen),
      new google.maps.LatLng(latitude + squareLen, longitude - squareLen)
    ];

    // Construct the polygon.
    hintLocation = new google.maps.Polygon({
      paths: squareCoords,
      strokeColor: '#00FF00',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#00FF00',
      fillOpacity: 0.35
    });

    hintLocation.setMap(map);
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
