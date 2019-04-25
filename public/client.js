var chunks;
var toggle = true;
navigator.mediaDevices.getDisplayMedia({

  //navigator.mediaDevices.getUserMedia({
  //audio: true,
  video: true,
}).then(stream => {
  // Display your local video in #localVideo element
    localVideo.srcObject = stream;
    var mediaRecorder = new MediaRecorder(stream);
    
  mediaRecorder.onstart = function(e) {
      chunks = [];
  };
  
  mediaRecorder.ondataavailable = function(e) {
    console.log('ondataavailable');
    chunks.push(e.data);
  };
  
  mediaRecorder.onstop = function(e) {
    console.log('onstop');
    var blob = new Blob(chunks, { 'type' : 'video/webm' });
    //socket.emit('radio', blob);
    var src = window.URL.createObjectURL(blob);
    if(toggle)
    {
      remoteVideo1.src = src;
    }
    else
    {
      remoteVideo2.src = src;
    }
    toggle = !toggle;
  };

  // Start recording
  mediaRecorder.start();

  // Stop recording after 5 seconds and broadcast it to server
  setInterval(function() {

    mediaRecorder.stop()
    mediaRecorder.start()
  }, 1000);
});

remoteVideo1.addEventListener("loadeddata", function() { 
  console.log('loaded1');
  remoteVideo1.style.zIndex = "5";
  remoteVideo2.style.zIndex = "1";
}, true);

remoteVideo2.addEventListener("loadeddata", function() { 
  console.log('loaded2');
  remoteVideo1.style.zIndex = "1";
  remoteVideo2.style.zIndex = "5";
}, true);