document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DEL REPRODUCTOR ---
    const audioBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const radioAudio = document.getElementById('radio-audio');
    const playerArtwork = document.getElementById('player-artwork');
    const visualizer = document.getElementById('hero-visualizer');
    
    // --- ELEMENTOS DE VOLUMEN ---
    const volumeSlider = document.getElementById('volume-slider');
    const volumeProgress = document.getElementById('volume-progress');
    const muteIcon = document.getElementById('mute-icon');
    
    // --- ELEMENTOS DE NAVEGACIÓN MÓVIL ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const navLinks = document.querySelectorAll('.nav-link');

    // Estado del reproductor
    let isPlaying = false;
    let lastVolume = 1; // 100%

    // --- REPRODUCTOR LOGIC ---
    function togglePlay(isAutoPlay = false) {
        if (isPlaying) {
            // Pause
            radioAudio.pause();
            playIcon.classList.remove('ri-pause-line');
            playIcon.classList.add('ri-play-fill');
            playerArtwork.classList.add('paused');
            visualizer.classList.add('hidden');
        } else {
            // Play
            // Para asegurar la carga desde el inicio en un stream continuo
            if (radioAudio.paused) {
                // Recuperar la fuente y recargarla para limpiar el buffer
                const sourceEl = radioAudio.querySelector('source');
                const streamUrl = radioAudio.currentSrc || radioAudio.src || (sourceEl ? sourceEl.src : '');
                if (streamUrl) {
                    radioAudio.src = streamUrl;
                    radioAudio.load();
                }
            }
            
            const playPromise = radioAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    playIcon.classList.remove('ri-play-fill');
                    playIcon.classList.add('ri-pause-line');
                    playerArtwork.classList.remove('paused');
                    visualizer.classList.remove('hidden');
                })
                .catch(error => {
                    console.log("Error de autoplay:", error);
                    if (!isAutoPlay) {
                        alert("Asegúrate de interactuar con la página primero para reproducir el audio.");
                    }
                    isPlaying = false; // rollback state
                });
            }
        }
        isPlaying = !isPlaying;
    }

    audioBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que dispare el clic del body
        togglePlay(false);
    });

    // --- AUTOPLAY LOGIC ---
    // Intentar reproducir al cargar la página
    setTimeout(() => {
        if (!isPlaying) {
            togglePlay(true);
        }
    }, 1000);

    // Si el navegador bloqueó el autoplay, iniciar al primer clic en la página
    document.body.addEventListener('click', () => {
        if (!isPlaying) {
            togglePlay(true);
        }
    }, { once: true });
    // --- VOLUME LOGIC ---
    function updateVolumeProgress() {
        const val = volumeSlider.value;
        volumeProgress.style.width = val + '%';
        radioAudio.volume = val / 100;
        
        // Actualizar el icono dependiendo del nivel
        if (val == 0) {
            muteIcon.className = 'ri-volume-mute-fill';
        } else if (val < 50) {
            muteIcon.className = 'ri-volume-down-fill';
        } else {
            muteIcon.className = 'ri-volume-up-fill';
        }
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', updateVolumeProgress);
        
        // Initialize volume
        updateVolumeProgress();

        // Mute Toggle
        muteIcon.addEventListener('click', () => {
            if (radioAudio.volume > 0) {
                // Guardar antes de mutear
                lastVolume = volumeSlider.value;
                volumeSlider.value = 0;
            } else {
                // Restaurar
                volumeSlider.value = lastVolume || 100;
            }
            updateVolumeProgress();
        });
    }

    // --- MOBILE MENU LOGIC ---
    function openMenu() {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileNav.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    mobileMenuBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- SMOOTH SCROLLING & ACTIVE LINK UPDATER ---
    const headerOffset = 85;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
               const elementPosition = targetElement.getBoundingClientRect().top;
               const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
               window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
               });
            }
        });
    });

    // --- CHANGE ACTIVE NAV LINK ON SCROLL ---
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - headerOffset - 100)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
    
    // Header effect on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(3, 3, 5, 0.9)';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            header.style.background = 'rgba(3, 3, 5, 0.7)';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
        }
    });

    // Form prevent default
    const form = document.querySelector('.contact-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.");
            form.reset();
        });
    }

});
