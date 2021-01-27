window.speechSynthesis.cancel();

function startSpeech() {

  console.log(window.speechSynthesis.paused);

  if (window.speechSynthesis.paused === true) {
    window.speechSynthesis.resume();
  }

  else {
    let msg = document.querySelector("p").textContent;

    let speech = new SpeechSynthesisUtterance();
    speech.lang = "en-US";

    speech.text = msg;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);

  }
}

function stopSpeech() {
  window.speechSynthesis.pause();
}