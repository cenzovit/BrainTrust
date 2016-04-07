function updateOnlineStatus(event) {
  if (navigator.onLine){
    $("body").removeClass("offline");
  }
  else {
    $("body").addClass("offline");
  }
}

$(document).ready(function(){
  updateOnlineStatus();

  $(window).on('online',  updateOnlineStatus);
  $(window).on('offline', updateOnlineStatus);

  

  // Setup SpeechKITT
  SpeechKITT.setStylesheet('../stylesheets/flat.min.css');
  SpeechKITT.setStartCommand(speechKITTAnnyangStart);
  SpeechKITT.setAbortCommand(continuousAnnyangAbort);

  SpeechKITT.vroom();
  annyang.start();
});
