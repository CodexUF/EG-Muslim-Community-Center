document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Navbar Scroll Effect ---
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('shadow-xl', 'bg-emerald-950');
            nav.classList.remove('bg-emerald-900/90');
        } else {
            nav.classList.remove('shadow-xl', 'bg-emerald-950');
            nav.classList.add('bg-emerald-900/90');
        }
    });

    // --- Prayer Times API ---
    const prayerTimesList = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const prayerContainer = document.getElementById('prayer-times-grid');

    async function fetchPrayerTimes() {
        try {
            // Default to London if location fails, otherwise we'd use geolocation
            const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=London&country=United+Kingdom&method=2');
            const data = await response.json();
            const timings = data.data.timings;

            if (prayerContainer) {
                prayerContainer.innerHTML = '';
                prayerTimesList.forEach(name => {
                    const time = timings[name];
                    const card = document.createElement('div');
                    card.className = 'bg-white p-4 rounded-xl shadow-md border-b-4 border-gold-500 text-center transform transition hover:scale-105';
                    card.innerHTML = `
                        <h4 class="text-emerald-800 font-bold uppercase text-xs tracking-widest">${name}</h4>
                        <p class="text-2xl font-serif text-emerald-950">${time}</p>
                    `;
                    prayerContainer.appendChild(card);
                });
            }

            updateNextPrayer(timings);
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            if (prayerContainer) {
                prayerContainer.innerHTML = '<p class="text-white">Failed to load prayer times. Please refresh.</p>';
            }
        }
    }

    function updateNextPrayer(timings) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        let nextPrayer = 'Fajr';
        let nextTimeStr = timings['Fajr'];

        for (const name of prayerTimesList) {
            const [hours, minutes] = timings[name].split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;
            if (prayerMinutes > currentTime) {
                nextPrayer = name;
                nextTimeStr = timings[name];
                break;
            }
        }

        const nextPrayerEl = document.getElementById('next-prayer-name');
        const nextTimeEl = document.getElementById('next-prayer-time');
        
        if (nextPrayerEl) nextPrayerEl.textContent = nextPrayer;
        if (nextTimeEl) nextTimeEl.textContent = nextTimeStr;
    }

    fetchPrayerTimes();

    // --- Scroll Animations ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('transition', 'duration-1000', 'ease-out', 'opacity-0', 'translate-y-10');
        observer.observe(el);
    });

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                // Show loading state
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Thank you! Your message has been sent successfully.');
                    contactForm.reset();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Something went wrong. Please try again later.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // --- Newsletter Form Submission ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalBtnIcon = submitBtn.innerHTML;
            
            const email = newsletterForm.querySelector('input[name="email"]').value;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
                
                const response = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Thank you for subscribing!');
                    newsletterForm.reset();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Newsletter error:', error);
                alert('Something went wrong. Please try again later.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnIcon;
            }
        });
    }
});
