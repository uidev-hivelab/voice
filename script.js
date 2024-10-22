// HTML 요소 가져오기
const recordButton = document.getElementById("recordButton");
const stopButton = document.getElementById("stopButton");
const sendButton = document.getElementById("sendButton");
const downloadLink = document.getElementById("downloadLink");

let mediaRecorder;
let audioChunks = [];
let audioBlob = null; // 전송할 녹음된 Blob

// 녹음 시작 버튼 클릭 이벤트
recordButton.addEventListener("click", () => {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);

      // 데이터가 수집될 때마다 audioChunks에 저장
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      // 녹음 종료 시 Blob으로 파일 생성
      mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // 다운로드 링크 설정
        downloadLink.href = audioUrl;
        downloadLink.download = "recording.wav";
        downloadLink.textContent = "녹음 파일 다운로드";
        downloadLink.classList.remove("hidden");

        // 버튼 재설정
        stopButton.disabled = true;
        recordButton.disabled = false;
        sendButton.disabled = false;
        console.log(audioUrl);
        console.log(mediaRecorder);
        
      };

      // 녹음 시작
      mediaRecorder.start();
      audioChunks = [];

      // 버튼 상태 변경
      recordButton.disabled = true;
      stopButton.disabled = false;
      downloadLink.classList.add("hidden");
      sendButton.disabled = true;
    })
    .catch((error) => {
      console.error("마이크 접근 실패: ", error);
    });
});

// 녹음 중지 버튼 클릭 이벤트
stopButton.addEventListener("click", () => {
  mediaRecorder.stop();
});

// API 전송 버튼 클릭 이벤트
// Base64 인코딩 함수
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary); // Base64 인코딩
  }
  
  // playerUID를 동적으로 전달할 수 있도록 설정, 기본값은 158
  const playerUID = 158;  // 필요에 따라 이 값을 변경할 수 있습니다
  
  sendButton.addEventListener('click', () => {
    if (audioBlob) {
      // Blob을 ArrayBuffer로 변환
      const reader = new FileReader();
      reader.readAsArrayBuffer(audioBlob);
      
      reader.onloadend = function() {
        const arrayBuffer = reader.result;
  
        // ArrayBuffer를 Base64로 변환
        const voiceBytesBase64 = arrayBufferToBase64(arrayBuffer);
  
        // JSON 데이터 생성
        const jsonData = {
          voiceBytes: voiceBytesBase64,  // Base64로 변환된 음성 데이터를 전송
          spellText: '플래시 카디언 서로를 보호하는 끈끈한 유대를'  // 요청하신 텍스트로 변경
        };
  
        // 동적으로 URL 생성
        const apiUrl = `https://scouter.relugames.dev:11080/player/voice/decide/${playerUID}`;

        console.log(jsonData)
  
        // API로 POST 요청 보내기
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',  // JSON 형식으로 전송
          },
          body: JSON.stringify(jsonData)  // JSON 데이터 전송
        })
        .then(response => response.json())
        .then(data => {
          console.log('파일 전송 성공: ', data);
        })
        .catch(error => {
          console.error('파일 전송 실패: ', error);
        });
      };
    }
  });
    
