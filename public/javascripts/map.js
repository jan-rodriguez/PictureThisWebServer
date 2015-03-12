$(document).ready(function(){

  //Add click listener to hide notification
  $("#hide-notification").click(function(){
    hideNotice();
  });

  //Boolean to check if notice is being displayed
  var isDisplayingNotice = true;

  function displayNotice(message, hideNotice, error, canHide){

    //We are displaying a notice
    isDisplayingNotice = true;

    var noticeWrapper = $("#notification-wrapper");
    var loadingIcon = $("#loading-gif");
    var noticeDiv = $("#notification");
    var hideNotification = $("#hide-notification");

    if(error){
      noticeWrapper.addClass("error");
    }else{
      noticeWrapper.removeClass("error");
    }

    if(hideNotice){
      loadingIcon.addClass("hide").css("display", "none");
    }else{
      loadingIcon.removeClass("hide").css("display", "inline-block")
    }

    noticeDiv.text(message);

    noticeDiv.removeClass("hide");
    noticeWrapper.removeClass("hide");

    //Alloe notification to be hidden
    if(canHide){
      hideNotification.css("visibility", "visible");
    }else{
      hideNotification.css("visibility", "hidden");
    }
  }

  function hideNotice(){
    //No longer displaying notice
    isDisplayingNotice = false;
    $("#notification-wrapper").addClass("hide");
  }

  function getChallengeId() {
    var currentWindowLocation = window.location.href;

    var windowLocArray = currentWindowLocation.split('/');

    var challengeIdIndex = windowLocArray.indexOf("challenge") + 1;

    return windowLocArray[challengeIdIndex];
  }

  function initializeMap(location) {
    var mapCanvas = document.getElementById('map-canvas');

    var noiseMax = .001;
    //In meters
    var circleRadius = 200;

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
      fillOpacity: 0.5,
      visible:false
    });

    //Error handling
    GeoMarker.addListener('geolocation_error', function(error){
      if(error.code === 1){
        displayNotice("Error getting location: location access denied.", true, true, true);
      }
      else if(error.code === 2){
        displayNotice("Error getting location: location unavailable.", true, true, true);
      }
      else{
        displayNotice("Error getting location.", true, true, true);
      }
    });

    GeoMarker.addListener('position_changed', function(){
      if(isDisplayingNotice){
        hideNotice();
      }
    });

  }

  function getChallengeLocation(challengeId) {

    var challUrl = '/challenge/'+challengeId;

    $.get(challUrl, function(data){
      if(data.length === 0){
        //Hide the loading icon and show error msg
        displayNotice("Couldn't find challenge.", true, true);
      }else{
        displayNotice("Loading your location.", false, false, true)
        initializeMap(data[0]);
      }
    });
  }

  var challengeId = getChallengeId();

  getChallengeLocation(challengeId);

});
