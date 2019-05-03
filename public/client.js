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

oldImage = new Image();
function recordImg() {
  navigator.mediaDevices.getDisplayMedia({

  //navigator.mediaDevices.getUserMedia({
  //audio: true,
  video: true,
}).then(stream => {
  // Display your local video in #localVideo element
    localVideo.srcObject = stream;
  //localCanvas.width = localVideo.videoWidth;
  //localCanvas.height = localVideo.videoHeight;
  

    // Stop recording after 5 seconds and broadcast it to server
    interval = setInterval(function() {
      localCanvas.width = localVideo.videoWidth;
      localCanvas.height = localVideo.videoHeight;
      localCanvas.getContext('2d').drawImage(localVideo, 0, 0, localCanvas.width ,localCanvas.height);
      
      newCanvas.width = localVideo.videoWidth;
      newCanvas.height = localVideo.videoHeight;
      oldCanvas.width = localVideo.videoWidth;
      oldCanvas.height = localVideo.videoHeight;
      diffCanvas.width = localVideo.videoWidth;
      diffCanvas.height = localVideo.videoHeight;
      

      
      oldCanvas.getContext('2d').drawImage(oldImage,0,0);
      newCanvas.getContext('2d').drawImage(localCanvas, 0, 0, newCanvas.width, newCanvas.height);
      
      var oldData = oldCanvas.getContext('2d').getImageData(0, 0, newCanvas.width, newCanvas.height),
          newData = newCanvas.getContext('2d').getImageData(0, 0, newCanvas.width, newCanvas.height),
          diff = diffCanvas.getContext('2d').createImageData(newCanvas.width, newCanvas.height);

      var result = pixelmatch(oldData.data, newData.data, diff.data, newCanvas.width, newCanvas.height, {threshold: 0.1});
      console.log(result);

      diffCanvas.getContext('2d').putImageData(diff, 0, 0);
           
      oldImage.src = localCanvas.toDataURL('image/png');
      
      if(result.diff > 0)
      {
        localCanvas.getContext('2d').getImageData(result.minX, result.minY, result.maxX-result.minX, result.maxY-result.minY);
      }
      
      dataURL = localCanvas.toDataURL();
      console.log('emit');
      socket.emit('IMG', {room,clientId, dataURL});
      
    }, 1000);

});

}

start.addEventListener("click", function() {
  console.log('start');
  if(interval === null)
  {
    recordImg();
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

socket.on('IMG', (message) => {
  console.log('on');
  remoteImage.src = message.dataURL;

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