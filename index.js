// Create animated rain
function createRain() {
    const container = document.getElementById('bgAnimation');
    const ground = document.getElementById('rainGround');
    
    // Create raindrops
    for (let i = 0; i < 100; i++) {
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 1 + 0.5;
        const height = Math.random() * 100 + 10;
        const delay = Math.random() * 2;
        
        raindrop.style.left = left + '%';
        raindrop.style.height = height + 'px';
        raindrop.style.animationDuration = animationDuration + 's';
        raindrop.style.animationDelay = delay + 's';
        
        container.appendChild(raindrop);
    }
    
    // Create ground ripples
    function createRipple() {
        const ripple = document.createElement('div');
        ripple.className = 'puddle-ripple';
        
        const left = Math.random() * 100;
        ripple.style.left = left + '%';
        ripple.style.bottom = Math.random() * 50 + 'px';
        
        ground.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 2000);
    }
    
    // Create ripples at random intervals
    setInterval(createRipple, 300 + Math.random() * 700);
}

// Audio context for ambient background music
let audioContext;
let isPlaying = false;
let gainNode;
let oscillators = [];

function createAmbientSound() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.connect(audioContext.destination);

    // Create peaceful rain sound
    const rainBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 4, audioContext.sampleRate);
    const rainData = rainBuffer.getChannelData(0);
    
    // Generate realistic rain noise with varying intensity
    for (let i = 0; i < rainData.length; i++) {
        let noise = (Math.random() * 2 - 1) * 0.1;
        // Add subtle variation to rain intensity
        const variation = Math.sin(i * 0.001) * 0.02;
        rainData[i] = noise * (0.8 + variation);
    }
    
    const rainSource = audioContext.createBufferSource();
    const rainGain = audioContext.createGain();
    const rainFilter = audioContext.createBiquadFilter();
    
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;
    
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1200, audioContext.currentTime);
    rainFilter.Q.setValueAtTime(0.7, audioContext.currentTime);
    
    rainGain.gain.setValueAtTime(0.08, audioContext.currentTime);
    
    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(gainNode);
    
    rainSource.start();

    // Create peaceful harmonic layers - based on natural harmonics
    const peacefulFrequencies = [
        { freq: 174, gain: 0.015 }, // Healing frequency
        { freq: 261.63, gain: 0.02 }, // C4
        { freq: 329.63, gain: 0.018 }, // E4
        { freq: 392, gain: 0.015 }, // G4
        { freq: 523.25, gain: 0.012 }, // C5
        { freq: 659.25, gain: 0.01 }, // E5
    ];
    
    peacefulFrequencies.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const oscGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        // Use triangle wave for warmer, more peaceful tone
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime);
        
        // Soft attack and release
        oscGain.gain.setValueAtTime(0, audioContext.currentTime);
        oscGain.gain.linearRampToValueAtTime(note.gain, audioContext.currentTime + 3 + index * 0.5);
        
        // Add subtle low-pass filtering for warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + index * 100, audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, audioContext.currentTime);
        
        // Add very slow, subtle vibrato for organic feel
        const vibrato = audioContext.createOscillator();
        const vibratoGain = audioContext.createGain();
        
        vibrato.type = 'sine';
        vibrato.frequency.setValueAtTime(0.05 + index * 0.01, audioContext.currentTime);
        vibratoGain.gain.setValueAtTime(1 + index * 0.2, audioContext.currentTime);
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        
        oscillator.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(gainNode);
        
        oscillator.start();
        vibrato.start();
        
        oscillators.push({ oscillator, vibrato });
    });

    // Add gentle pad synth with slow evolution
    const padFrequencies = [65.41, 82.41, 98, 130.81]; // Low C, E, G, C octave
    
    padFrequencies.forEach((freq, index) => {
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const oscGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        
        osc1.frequency.setValueAtTime(freq, audioContext.currentTime);
        osc2.frequency.setValueAtTime(freq * 1.007, audioContext.currentTime); // Slight detuning
        
        oscGain.gain.setValueAtTime(0, audioContext.currentTime);
        oscGain.gain.linearRampToValueAtTime(0.008, audioContext.currentTime + 5 + index);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, audioContext.currentTime);
        filter.Q.setValueAtTime(1, audioContext.currentTime);
        
        // Slow filter sweep for evolving texture
        filter.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 30);
        filter.frequency.linearRampToValueAtTime(300, audioContext.currentTime + 60);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(gainNode);
        
        osc1.start();
        osc2.start();
        
        oscillators.push({ oscillator: osc1, oscillator2: osc2 });
    });

    // Add soft reverb effect using delay and feedback
    const delay = audioContext.createDelay(0.3);
    const delayGain = audioContext.createGain();
    const feedback = audioContext.createGain();
    
    delay.delayTime.setValueAtTime(0.15, audioContext.currentTime);
    delayGain.gain.setValueAtTime(0.15, audioContext.currentTime);
    feedback.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    gainNode.connect(delay);
    delay.connect(delayGain);
    delay.connect(feedback);
    feedback.connect(delay);
    delayGain.connect(audioContext.destination);
}

function toggleMusic() {
    const button = document.getElementById('audioToggle');
    
    if (!isPlaying) {
        if (!audioContext) {
            createAmbientSound();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        button.textContent = '🔇 Mute';
        isPlaying = true;
    } else {
        if (audioContext) {
            audioContext.suspend();
        }
        button.textContent = '🎵 Music';
        isPlaying = false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    createRain();
    
    document.getElementById('audioToggle').addEventListener('click', toggleMusic);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 1s ease-out forwards';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.backgroundPositionY = -(scrolled * 0.5) + 'px';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.about-tabs .tab');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            // Add active class to the clicked tab and corresponding pane
            tab.classList.add('active');
            const targetPane = document.getElementById(tab.dataset.tab);
            targetPane.classList.add('active');
        });
    });
});


const toggleBtn = document.getElementById('toggle-btn');
const moreText = document.getElementById('more-text');

    toggleBtn.addEventListener('click', () => {
        if (moreText.style.display === 'none') {
            moreText.style.display = 'block';
            toggleBtn.textContent = 'View Less';
        } else {
            moreText.style.display = 'none';
            toggleBtn.textContent = 'View More';
        }
    });

