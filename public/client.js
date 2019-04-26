var chunks;
var toggle = true;
var mediaRecorder;
var interval = null;

if (!location.hash) {
  location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
}
const room = location.hash.substring(1);

var socket = io();
socket.emit('JOIN', room);

let clientId = null;
 socket.on('connect', () => {
    clientId = socket.id; // an alphanumeric id...
 });


function record() {
navigator.mediaDevices.getDisplayMedia({

  //navigator.mediaDevices.getUserMedia({
  //audio: true,
  video: true,
}).then(stream => {
  // Display your local video in #localVideo element
    localVideo.srcObject = stream;
  mediaRecorder = new MediaRecorder(stream);
    
  mediaRecorder.onstart = function(e) {
      chunks = [];
  };
  
  mediaRecorder.ondataavailable = function(e) {
    console.log('ondataavailable');
    chunks.push(e.data);
  };
  
  mediaRecorder.onstop = function(e) {
    console.log('onstop');
    //var blob = new Blob(chunks, { 'type' : 'video/webm' });
    //socket.emit('radio', blob);
    
    socket.emit('VIDEO', {room,clientId, chunks});
    
  };

  // Start recording
      mediaRecorder.start();

    // Stop recording after 5 seconds and broadcast it to server
    interval = setInterval(function() {

      mediaRecorder.stop()
      mediaRecorder.start()
    }, 1000);

});

}
start.addEventListener("click", function() {
  console.log('start');
  if(interval === null)
  {
    record();
  }
  else
  {
    clearInterval(interval)
    interval = null;
    
    let tracks = localVideo.srcObject.getTracks();

    tracks.forEach(track => track.stop());
    localVideo.srcObject = null;
  }
})

socket.on('VIDEO', (message) => {
    console.log(message);
    var b = new Blob(message.chunks, { 'type' : 'video/webm' })
    var src = window.URL.createObjectURL(b);
    if(toggle)
    {
      remoteVideo1.src = src;
    }
    else
    {
      remoteVideo2.src = src;
    }
    toggle = !toggle;

})


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