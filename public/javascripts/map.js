$(document).ready(function(){
  function getChallengeId() {
    var currentWindowLocation = window.location.href;

    var windowLocArray = currentWindowLocation.split('/');

    var challengeIdIndex = windowLocArray.indexOf("challenge") + 1;

    return windowLocArray[challengeIdIndex];
  }

  function initializeMap(location) {
    var mapCanvas = document.getElementById('map-canvas');

    //NOISE VARIANCE, IN DEGREES
    //IS STILL WITHIN THE CIRCLE BECAUSE MAX DISTANCE OF .002 DEGREES IS 222 METERS AT EQUATOR
    var noiseMax = .002;

    //Actual latitude and longitude values
    var latitude = location.latitude;
    var longitude = location.longitude;

    //Add randomness to location, so it's not always in the middle
    var randomNoise = Math.random() * noiseMax;
    var fakeLatitude = Math.random() > .5 ? latitude + randomNoise : latitude - randomNoise;
    randomNoise = Math.random() * noiseMax;
    var fakeLongitude = Math.random() > .5 ? longitude + randomNoise : longitude - randomNoise;


    var mapOptions = {
      center: new google.maps.LatLng(fakeLatitude, fakeLongitude),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(mapCanvas, mapOptions);

    //In meters, HAS TO AT LEAST BE LARGER THAN 222 TO BE WITHIN NOISE
    var hintCircleRadius = 400;
    // Construct the polygon.
    var hintCircleOptions = {
      strokeColor: '#00AA00',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#00AA00',
      fillOpacity: 0.1,
      map: map,
      center: new google.maps.LatLng(fakeLatitude, fakeLongitude),
      radius: hintCircleRadius
    };

    //Draw circle
    var hintCircle = new google.maps.Circle(hintCircleOptions);

    var GeoMarker = new GeolocationMarker(map);

    //Hide the accuracy marker
    GeoMarker.setCircleOptions({
      strokeColor: '#cccccc',
      strokeOpacity: .8,
      strokeWeight: 2,
      fillColor: '#cccccc',
      fillOpacity: .2,
      visible: false
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

    var hotOrColdCircleOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.25,
      map: map,
      radius: hintCircleRadius/15,
      visible: false
    };
    //Cicle showing the player how close they are to the actual location
    var hotOrColdCircle = new google.maps.Circle(hotOrColdCircleOptions);

    //Update the hint circle to match the current location
    GeoMarker.addListener('position_changed', function(){

      var currentPos = GeoMarker.getPosition();

      //Set center of hot or cold circle at player's location
      hotOrColdCircle.setCenter(currentPos);

      var newColor = getHorOrColdColor(currentPos);

      hotOrColdCircle.setOptions({
        color: newColor,
        visible: true
      });

    });

    function getHorOrColdColor(latLong){
      var curLat = latLong.lat();
      var curLong = latLong.lng();

      console.log("Lat, long: "+latitude+", "+longitude);
      console.log("Cur lat, long: "+curLat+", "+curLong);

      //TODO: TRY TO MAKE THIS METERS, NOT USING LATITUDE AND LONGITUDE
      //CHECKOUT http://www.movable-type.co.uk/scripts/latlong.html
      var distance = Math.abs(Math.sqrt((latitude*latitude) + (longitude*longitude)) - Math.sqrt((curLat*curLat) + (curLong*curLong)));

      console.log(distance);

      var color;

      //Too far, color is red
      if(distance > noiseMax){
        color = "#FF0000";
      }else{ //Range from red to green
        var difference = noiseMax - distance;

        console.log("Difference : "+difference);

        //Get the change of color from red to green
        var colorChange = Math.round(difference/noiseMax * 512);

        console.log("colorChange: "+colorChange);

        var green = colorChange < 256 ? numToHex(colorChange) : "FF";
        var red = colorChange > 256 ? numToHex(512-colorChange) : "00";

        color = "#"+red+green+"00";

      }

      return color;

    }

    function numToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

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
