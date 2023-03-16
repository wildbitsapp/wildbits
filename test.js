var connection = new signalR.HubConnectionBuilder()
  .withUrl('https://signal.webrtc.tools/ChatHub')
  .build()
var yourConn
var remoteVideoLoad = 0
var arrayOfMediaStream = []
var name
var connectedUser
var lastTimeOtherUserWasInsidenew = new Date()
var configuration
var baseUrl =
  'https://webrtc.tools/api/gISDefault.aspx?ChatGuid=' + ChatGuid + '&UserGuid=' + UserGuid //alert(baseUrl); $.ajax({ url: baseUrl, async: false, success: function (result) { configuration = result; } }); if (configuration == "RoomNotExists") { var d1 = { type: "RoomNotExists", message: "500"}; GetAction(d1); throw new Error("RoomNotExists!"); } function hex_to_ascii(str1) { var hex = str1.toString(); var str = ''; for (var n = 0; n < hex.length; n += 2) { str += String.fromCharCode(parseInt(hex.substr(n, 2), 16)); } return str; } var s = JSON.parse(hex_to_ascii(configuration)); configuration = JSON.parse('{"iceServers":[{"url":"stun:stun.l.google.com:19302"},{"url":"turn:' + s.is[0].p + ':80?transport=udp","username":"' + s.is[0].p2 + '","credential":"' + s.is[0].p3 + '" },{"url":"turn:' + s.is[0].p + ':80?transport=tcp","username":"' + s.is[0].p2 + '","credential":"' + s.is[0].p3 + '"}]}'); yourConn = new RTCPeerConnection(configuration); function SetAction(actionName, DataToOtherUser) { switch (actionName) { case "Disconnect": connection.invoke("Generic", "Disconnect", JSON.stringify({ type: "leave" }), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }); handleLeave(); break; case "CustomCallToOtherUser": var customObject = { type: "CustomCallToOtherUser", data: DataToOtherUser }; if (yourConn.connectionState == "connected") { connection.invoke("Generic", "WebRtcOther", JSON.stringify(customObject), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }); } break; case "Connect": //var callToUsername = callToUsernameInput.value; //if (callToUsername.length > 0) { //connectedUser = callToUsername; yourConn.createOffer(function (offer) { connection.invoke("Generic", "WebRtcOther", JSON.stringify({ type: "offer", offer: offer }), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }); console.log("offer:" + offer); yourConn.setLocalDescription(offer); }, function (error) { alert("Error when creating an offer"); }); //} break; case "SendTxt": connection.invoke("Generic", "Conversation", JSON.stringify({ type: "Conversation", name: $("#txtMessage")[0].value, WhoSend: "749" }), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }); $("#txtMessage")[0].value = ''; break; default: break; } } function getCookie(cname) { var name = cname + "="; var decodedCookie = decodeURIComponent(document.cookie); var ca = decodedCookie.split(';'); for (var i = 0; i < ca.length; i++) { var c = ca[i]; while (c.charAt(0) == ' ') { c = c.substring(1); } if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); } } return ""; } $(document).ready(function () { connection.start().catch(function (err) { return console.error(err.toString()); }).then(() => { connection.invoke("Generic", "Initialize", "Login", UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }).then(() => { connection.invoke("Generic", "WebRtcMe", JSON.stringify({ type: "Login", name: "Supplier" }), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }); }); }); connection.on("SendMessage", function (msg) { var data = JSON.parse(msg); switch (data.type) { case "Login": GetAction(data); handleLogin(data.success); break; case "CustomCallToOtherUser": GetAction(data); break; case "Disconnect": GetAction(data); break; case "newUser": GetAction(data); break; case "answer": console.log("answer", msg); handleAnswer(data.answer); break; case "offer": //logError("offer" + ":" + data.offer.sdp); console.log("offer", msg); handleOffer(data.offer, data.name); break; //when a remote peer sends an ice candidate to us case "candidate": console.log("candidate", msg); handleCandidate(data.candidate); break; case "Conversation": GetAction(data); break; case "OnlineNotification": if (remoteVideoLoad == 0) { //$(".otherUserOnLine").show(); //remoteVideoLoad = 1; } if (remoteVideoLoad == 1) { if (yourConn.iceConnectionState == "disconnected") { beforeVideoConnect(); remoteVideoLoad = 0; } } lastTimeOtherUserWasInsidenew = new Date(); break; default: break; } }); //var callPage = document.querySelector('#callPage'); //var callToUsernameInput = document.querySelector('#callToUsernameInput'); yourConn.ontrack = function (event) { arrayOfMediaStream[1] = event.streams[0]; remoteVideo.srcObject = event.streams[0]; }; yourConn.onicecandidate = function (event) { if (event.candidate) { connection.invoke("Generic", "WebRtcOther", JSON.stringify({ type: "candidate", candidate: event.candidate }), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }); } }; setInterval(function () { connection.invoke("Generic", "OnlineNotification", JSON.stringify({ type: "OnlineNotification", name: "" }), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }); },10000); }); function handleOffer(offer, name) { connectedUser = name; try { window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription; var RTCSessionDescription_ = new window.RTCSessionDescription(offer); yourConn.setRemoteDescription(RTCSessionDescription_); } catch (err) { logError(err.message); console.log(err.message); } //create an answer to an offer yourConn.createAnswer(function (answer) { yourConn.setLocalDescription(answer); connection.invoke("Generic", "WebRtcOther", JSON.stringify({ type: "answer", answer: answer }), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 return console.log(err.message); }); }, function (error) { logError(error); alert("Error when creating an answer"); }); }; var stream; function handleLogin(success) { if (success === false) { alert("Ooops...try a different username"); } else { callPage.style.display = "block"; navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices; navigator.getUserMedia( { video: { width: 480, height: 360, //aspectRatio: { ideal: 1.7777777778 } deviceId: getCookie("videoSource") }, audio: { deviceId: getCookie("audioSource"), sampleSize: 16, channelCount: 2 } } , function (myStream) { arrayOfMediaStream[0] = myStream; localVideo.srcObject = myStream; myStream.getTracks().forEach(function (track) { yourConn.addTrack(track, myStream); }); }, function (error) { console.log(error); }); } } yourConn.onconnectionstatechange = function (event) { var data1 = JSON.stringify({ type: "connectionStatus", answer: yourConn.connectionState }); GetAction(JSON.parse(data1)); }; //when we got an answer from a remote user function handleAnswer(answer) { try { window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription; yourConn.setRemoteDescription(new window.RTCSessionDescription(answer)); } catch (err) { logError(err.message) } }; //when we got an ice candidate from a remote user function handleCandidate(candidate) { try { window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate; yourConn.addIceCandidate(new window.RTCIceCandidate(candidate)); } catch (err) { logError(err.message) } }; //hang up //hangUpBtn.addEventListener("click", function () { // connection.invoke("Generic", "WebRtcOther", JSON.stringify({ // type: "leave" // }), RequestToVideoInterviewGuid, WhoSend, CT, Name).catch(function (err) {//9/8/19 // return console.log(err.message); // }); // handleLeave(); //}); function handleLeave() { connectedUser = null; remoteVideo.src = null; localVideo.src = null; yourConn.close(); yourConn.onicecandidate = null; yourConn.onaddstream = null; //connection.invoke("Generic", "Conversation", JSON.stringify({ // type: "conversation", // name: "Other user disconnect" //}), UserGuid, ChatGuid, Name).catch(function (err) {//9/8/19 // return console.log(err.message); //}); }; function handleStop(event) { console.log('Recorder stopped: ', event); }
