document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Mobile Navigation Toggle ---
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.querySelector('.primary-navigation');
    const hamburger = document.querySelector('.hamburger');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            primaryNav.classList.toggle('is-open');
            hamburger.classList.toggle('is-active');
        });

        // Close nav when clicking a link
        primaryNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                primaryNav.classList.remove('is-open');
                hamburger.classList.remove('is-active');
            });
        });
    }

    // --- 2. Scroll Animations (Intersection Observer) ---
    const faders = document.querySelectorAll('.fade-in, .slide-up, .slide-in-left, .slide-in-right');
    
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // --- 3. FAQ Accordion ---
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Close all other accordions (optional, remove if you want multiple open)
            accordions.forEach(otherAcc => {
                if (otherAcc !== this) {
                    otherAcc.setAttribute('aria-expanded', 'false');
                    otherAcc.nextElementSibling.style.maxHeight = null;
                }
            });

            this.setAttribute('aria-expanded', !isExpanded);
            const content = this.nextElementSibling;
            
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // --- 4. Today's Hours Logic ---
    const todayStatus = document.getElementById('today-status');
    const hoursTableRows = document.querySelectorAll('.hours-table tr');
    
    if (todayStatus && hoursTableRows.length > 0) {
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        hoursTableRows.forEach(row => {
            if (parseInt(row.getAttribute('data-day')) === today) {
                row.classList.add('today-highlight');
                const hoursText = row.querySelectorAll('td')[1].textContent;
                
                if (hoursText.toLowerCase().includes('closed')) {
                    todayStatus.textContent = "Closed Today";
                    todayStatus.className = "today-status status-closed";
                } else {
                    todayStatus.textContent = `Open Today: ${hoursText}`;
                    todayStatus.className = "today-status status-open";
                }
            }
        });
    }

    // --- 5. Current Year in Footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 6. Form Submission (Fetch API to Web3Forms) ---
    const form = document.getElementById('appointment-form');
    const formResult = document.getElementById('form-result');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation check
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // UI Feedback during submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            formResult.style.display = 'none';
            formResult.className = 'form-result';

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    formResult.textContent = 'Request submitted successfully! We will contact you soon.';
                    formResult.classList.add('success');
                    form.reset();
                } else {
                    console.log(response);
                    formResult.textContent = json.message || 'Something went wrong. Please try again.';
                    formResult.classList.add('error');
                }
            })
            .catch(error => {
                console.log(error);
                formResult.textContent = 'Something went wrong! Please check your network and try again.';
                formResult.classList.add('error');
            })
            .finally(() => {
                formResult.style.display = 'block';
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                
                // Hide success message after 5 seconds
                if (formResult.classList.contains('success')) {
                    setTimeout(() => {
                        formResult.style.display = 'none';
                        formResult.classList.remove('success');
                    }, 5000);
                }
            });
        });
    }
});
