const audioContext = new AudioContext();

const SAMPLE_RATE = audioContext.sampleRate;
const timeLength = 1; // measured in seconds

const buffer = audioContext.createBuffer(
  1,
  SAMPLE_RATE * timeLength,
  SAMPLE_RATE
);
const channelData = buffer.getChannelData(0);

for (let i = 0; i < buffer.length; i++) {
  channelData[i] = Math.random() * 2 - 1;
}

const primaryGainControl = audioContext.createGain();
primaryGainControl.gain.setValueAtTime(0.05, 0);
primaryGainControl.connect(audioContext.destination);

let last = null;

// {
//   const button = document.createElement('button');
//   button.innerText = 'White Noise';

//   button.addEventListener('click', () => {
//     if (last) {
//       last.stop();
//     }
//     const whiteNoiseSource = audioContext.createBufferSource();
//     whiteNoiseSource.buffer = buffer;

//     whiteNoiseSource.connect(primaryGainControl);
//     whiteNoiseSource.start();
//     last = whiteNoiseSource;
//   });

//   document.body.appendChild(button);
// }

{
  const snareFilter = audioContext.createBiquadFilter();
  snareFilter.type = 'highpass';
  snareFilter.frequency.value = 3500; // Measured in Hz

  const snareButton = document.createElement('button');
  snareButton.innerText = 'Snare';

  //   snareButton.addEventListener('click', () => {
  //     if (last) {
  //       last.stop();
  //     }
  //     const whiteNoiseSource = audioContext.createBufferSource();
  //     whiteNoiseSource.buffer = buffer;
  //     snareFilter.connect(primaryGainControl);
  //     whiteNoiseSource.connect(snareFilter);
  //     whiteNoiseSource.start();
  //     last = whiteNoiseSource;
  //   });

  snareButton.addEventListener('click', () => {
    const whiteNoiseSource = audioContext.createBufferSource();
    whiteNoiseSource.buffer = buffer;

    // Control the gain of our snare white noise
    const whiteNoiseGain = audioContext.createGain();
    whiteNoiseGain.gain.setValueAtTime(1, audioContext.currentTime);
    whiteNoiseGain.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );
    whiteNoiseGain.connect(audioContext.destination);
    whiteNoiseSource.connect(whiteNoiseGain);
    whiteNoiseGain.connect(snareFilter);
    whiteNoiseSource.start();
    whiteNoiseSource.stop(audioContext.currentTime + 0.2);

    // // Set up an oscillator to provide a 'snap' sound
    // const snareOscillator = audioContext.createOscillator();
    // snareOscillator.type = 'triangle';
    // snareOscillator.frequency.setValueAtTime(100, audioContext.currentTime);

    // // Control the gain of our snare oscillator
    // const oscillatorGain = audioContext.createGain();
    // oscillatorGain.gain.setValueAtTime(0.7, audioContext.currentTime);
    // oscillatorGain.gain.exponentialRampToValueAtTime(
    //   0.01,
    //   audioContext.currentTime + 0.1
    // );
    // snareOscillator.connect(oscillatorGain);
    // oscillatorGain.connect(primaryGainControl);
    // snareOscillator.start();
    // snareOscillator.stop(audioContext.currentTime + 0.2);
  });
  document.body.appendChild(snareButton);
}

{
  const kickButton = document.createElement('button');
  kickButton.innerText = 'Kick';
  kickButton.addEventListener('click', () => {
    if (last) {
      last.stop();
    }
    const kickOscillator = audioContext.createOscillator();

    const kickGain = audioContext.createGain();
    kickGain.gain.setValueAtTime(1, 0);
    kickGain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5
    );
    kickOscillator.connect(kickGain);
    kickGain.connect(primaryGainControl);

    // Inside of our event listener
    kickOscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    kickOscillator.frequency.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5
    );
    kickOscillator.connect(kickGain);
    kickOscillator.start();
    kickOscillator.stop(audioContext.currentTime + timeLength);

    last = kickOscillator;
  });
  document.body.appendChild(kickButton);
}

const notes = [
  { name: 'C', frequency: 261.63 },
  { name: 'C#', frequency: 277.18 },
  { name: 'D', frequency: 293.66 },
  { name: 'D#', frequency: 311.13 },
  { name: 'E', frequency: 329.63 },
  { name: 'F', frequency: 349.23 },
  { name: 'F#', frequency: 369.99 },
  { name: 'G', frequency: 392.0 },
  { name: 'G#', frequency: 415.3 },
  { name: 'A', frequency: 440.0 },
  { name: 'A#', frequency: 466.16 },
  { name: 'B', frequency: 493.88 },
  { name: 'C', frequency: 523.25 },
];

{
  let lastNote = null;
  notes.forEach((note) => {
    const btn = document.createElement('button');
    btn.innerText = note.name;
    btn.onclick = () => {
      if (lastNote) {
        lastNote.stop();
      }
      const now = audioContext.currentTime;
      const attackTime = 0.2;
      const decayTime = 0.3;
      const sustainLevel = 0.7;
      const releaseTime = 0.2;
      const duration = 1;
      const noteGain = audioContext.createGain();
      noteGain.gain.setValueAtTime(0, 0);
      noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
      noteGain.gain.linearRampToValueAtTime(
        sustainLevel,
        now + attackTime + decayTime
      );
      noteGain.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
      noteGain.gain.linearRampToValueAtTime(0, now + duration);

      const ocillator = audioContext.createOscillator();
      ocillator.type = 'square';
      ocillator.frequency.setValueAtTime(
        note.frequency,
        audioContext.currentTime
      );
      noteGain.connect(primaryGainControl);
      ocillator.connect(noteGain);
      ocillator.start();
      ocillator.stop(audioContext.currentTime + 1);
      lastNote = ocillator;
    };

    document.body.appendChild(btn);
  });
}
