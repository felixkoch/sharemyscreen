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
        var areaData = localCanvas.getContext('2d').getImageData(result.minX, result.minY, result.maxX-result.minX, result.maxY-result.minY);
        areaCanvas.width = result.maxX-result.minX
        areaCanvas.height = result.maxY-result.minY
        areaCanvas.getContext('2d').putImageData(areaData, 0, 0);
        dataURL = areaCanvas.toDataURL();
        socket.emit('IMG', {room,
                            clientId,
                            videoWidth: localVideo.videoWidth,
                            videoHeight: localVideo.videoHeight,
                            imgWidth: result.maxX-result.minX,
                            imgHeight: result.maxY-result.minY,
                            imgX: result.minX,
                            imgY:result.minY,
                            
                            dataURL});
      }
      
      //dataURL = localCanvas.toDataURL();
      console.log('emit');
      //socket.emit('IMG', {room,clientId, dataURL});
      
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

socket.on('IMG', (message) => {
  console.log('on');
  
  remoteCanvas.width = message.videoWidth;
  remoteCanvas.height = message.videoHeight;
  
  var remoteImage = new Image();
  remoteImage.onload = function() {
     remoteCanvas.getContext('2d').drawImage(remoteImage, message.imgX, message.imgY);//, message.imgWidth, message.imgY);
  };
  
  remoteImage.src = message.dataURL;
  
})
