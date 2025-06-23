/**
 * BLOOMTECH CRISIS SIMULATION
 * JavaScript pour interactions startup modernes
 * Version: 1.0
 */

// ===========================
// CONSTANTS & CONFIGURATION
// ===========================

const CONFIG = {
  // Timer settings
  BOARD_MEETING_HOURS: 3,
  BOARD_MEETING_MINUTES: 45,
  BOARD_MEETING_SECONDS: 0,
  
  // Animation settings
  SCROLL_OFFSET: 120, // Offset pour le header sticky
  SMOOTH_SCROLL_DURATION: 800,
  
  // Update intervals
  TIMER_UPDATE_INTERVAL: 1000, // 1 seconde
  
  // Local storage keys (si besoin plus tard)
  STORAGE_KEYS: {
    START_TIME: 'bloomtech_start_time',
    USER_PROGRESS: 'bloomtech_progress'
  }
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Utilitaire pour formater les nombres avec zéro initial
 */
function padZero(num) {
  return num.toString().padStart(2, '0');
}

/**
 * Utilitaire pour calculer le temps restant
 */
function calculateTimeRemaining(targetTime) {
  const now = new Date().getTime();
  const difference = targetTime - now;
  
  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds, isExpired: false };
}

/**
 * Utilitaire pour l'animation de scroll smooth
 */
function smoothScrollTo(target, offset = CONFIG.SCROLL_OFFSET) {
  const targetElement = document.querySelector(target);
  if (!targetElement) return;
  
  const targetPosition = targetElement.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = CONFIG.SMOOTH_SCROLL_DURATION;
  let start = null;
  
  function animation(currentTime) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  
  // Fonction d'easing pour une animation plus naturelle
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  requestAnimationFrame(animation);
}

/**
 * Gestionnaire d'erreurs global
 */
function handleError(error, context = 'Unknown') {
  console.error(`[BloomTech Crisis] Error in ${context}:`, error);
  // En production, on pourrait envoyer ça à un service de monitoring
}

// ===========================
// COUNTDOWN TIMER
// ===========================

class CountdownTimer {
  constructor() {
    this.targetTime = null;
    this.timerInterval = null;
    this.isRunning = false;
    
    // Elements DOM
    this.countdownElement = document.getElementById('countdown');
    this.missionCountdownElement = document.getElementById('mission-countdown');
    this.timerStatusElement = document.querySelector('.timer-status');
    
    this.init();
  }
  
  init() {
    // Calculer le temps cible (maintenant + durée configurée)
    const now = new Date();
    this.targetTime = new Date(
      now.getTime() + 
      (CONFIG.BOARD_MEETING_HOURS * 60 * 60 * 1000) +
      (CONFIG.BOARD_MEETING_MINUTES * 60 * 1000) +
      (CONFIG.BOARD_MEETING_SECONDS * 1000)
    );
    
    this.startTimer();
  }
  
  startTimer() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.updateDisplay(); // Mise à jour immédiate
    
    this.timerInterval = setInterval(() => {
      this.updateDisplay();
    }, CONFIG.TIMER_UPDATE_INTERVAL);
  }
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isRunning = false;
  }
  
  updateDisplay() {
    try {
      const timeRemaining = calculateTimeRemaining(this.targetTime.getTime());
      
      if (timeRemaining.isExpired) {
        this.handleTimeExpired();
        return;
      }
      
      // Mise à jour du timer principal
      if (this.countdownElement) {
        const hoursElement = this.countdownElement.querySelector('.time-hours');
        const minutesElement = this.countdownElement.querySelector('.time-minutes');
        const secondsElement = this.countdownElement.querySelector('.time-seconds');
        
        if (hoursElement) hoursElement.textContent = padZero(timeRemaining.hours);
        if (minutesElement) minutesElement.textContent = padZero(timeRemaining.minutes);
        if (secondsElement) secondsElement.textContent = padZero(timeRemaining.seconds);
      }
      
      // Mise à jour du timer de mission
      if (this.missionCountdownElement) {
        this.missionCountdownElement.textContent = 
          `${timeRemaining.hours}h ${padZero(timeRemaining.minutes)}m`;
      }
      
      // Changement de style selon l'urgence
      this.updateUrgencyStyles(timeRemaining);
      
    } catch (error) {
      handleError(error, 'CountdownTimer.updateDisplay');
    }
  }
  
  updateUrgencyStyles(timeRemaining) {
    const totalMinutesLeft = (timeRemaining.hours * 60) + timeRemaining.minutes;
    
    // Changement de couleur selon l'urgence
    if (totalMinutesLeft <= 30 && this.timerStatusElement) {
      this.timerStatusElement.textContent = 'EMERGENCY';
      this.timerStatusElement.style.background = 'var(--danger-primary)';
      this.timerStatusElement.style.animation = 'glow 1s ease-in-out infinite alternate';
    } else if (totalMinutesLeft <= 60 && this.timerStatusElement) {
      this.timerStatusElement.textContent = 'URGENT';
      this.timerStatusElement.style.background = 'var(--warning-primary)';
    }
  }
  
  handleTimeExpired() {
    this.stopTimer();
    
    // Mise à jour de l'affichage
    if (this.countdownElement) {
      this.countdownElement.innerHTML = '<span style="color: var(--danger-primary); font-weight: 800;">TIME\'S UP!</span>';
    }
    
    if (this.missionCountdownElement) {
      this.missionCountdownElement.textContent = 'EXPIRED';
    }
    
    if (this.timerStatusElement) {
      this.timerStatusElement.textContent = 'BOARD MEETING STARTED';
      this.timerStatusElement.style.background = 'var(--danger-primary)';
      this.timerStatusElement.style.animation = 'pulse 0.5s ease-in-out infinite';
    }
    
    // Animation d'alerte
    this.triggerTimeExpiredAlert();
  }
  
  triggerTimeExpiredAlert() {
    // Création d'une notification visuelle
    const alertElement = document.createElement('div');
    alertElement.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--danger-gradient);
        color: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        text-align: center;
        animation: slideInUp 0.5s ease-out;
      ">
        <h2 style="margin: 0 0 1rem 0; font-size: 2rem;">⏰ TIME'S UP!</h2>
        <p style="margin: 0; font-size: 1.25rem;">The board meeting has started!</p>
      </div>
    `;
    
    document.body.appendChild(alertElement);
    
    // Suppression automatique après 5 secondes
    setTimeout(() => {
      if (alertElement.parentNode) {
        alertElement.parentNode.removeChild(alertElement);
      }
    }, 5000);
  }
}

// ===========================
// NAVIGATION & SCROLL
// ===========================

class NavigationManager {
  constructor() {
    this.activeSection = null;
    this.init();
  }
  
  init() {
    this.setupSmoothScrolling();
    this.setupScrollSpy();
    this.setupMobileMenuToggle();
  }
  
  setupSmoothScrolling() {
    // Gestion des liens d'ancrage
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
      e.preventDefault();
      const targetId = link.getAttribute('href');
      
      if (targetId === '#') {
        // Retour en haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      smoothScrollTo(targetId);
      
      // Tracking de l'interaction (pour analytics futures)
      this.trackNavigation(targetId);
    });
  }
  
  setupScrollSpy() {
    // Observer pour mettre en surbrillance la section active
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateActiveNavLink(entry.target.id, navLinks);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-120px 0px -80% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
  }
  
  updateActiveNavLink(sectionId, navLinks) {
    this.activeSection = sectionId;
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  setupMobileMenuToggle() {
    // Gestion responsive de la navigation
    const nav = document.querySelector('.quick-nav');
    if (!nav) return;
    
    let isMenuOpen = false;
    
    // Création d'un bouton menu mobile si nécessaire
    this.createMobileMenuButton(nav);
  }
  
  createMobileMenuButton(nav) {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    if (mediaQuery.matches && !nav.querySelector('.mobile-menu-toggle')) {
      const toggleButton = document.createElement('button');
      toggleButton.className = 'mobile-menu-toggle';
      toggleButton.innerHTML = '☰';
      toggleButton.style.cssText = `
        display: block;
        background: var(--primary-gradient);
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: var(--radius-md);
        font-size: 1.25rem;
        cursor: pointer;
        margin: 0 auto;
      `;
      
      const navContainer = nav.querySelector('.nav-container');
      navContainer.style.display = 'none';
      
      toggleButton.addEventListener('click', () => {
        const isHidden = navContainer.style.display === 'none';
        navContainer.style.display = isHidden ? 'flex' : 'none';
        toggleButton.innerHTML = isHidden ? '✕' : '☰';
      });
      
      nav.insertBefore(toggleButton, navContainer);
    }
  }
  
  trackNavigation(targetId) {
    // Placeholder pour le tracking d'analytics
    console.log(`[Navigation] User navigated to: ${targetId}`);
  }
}

// ===========================
// EMAIL INTERACTIONS
// ===========================

class EmailManager {
  constructor() {
    this.readEmails = new Set();
    this.init();
  }
  
  init() {
    this.setupEmailTracking();
    this.setupEmailAnimations();
    this.setupPriorityFiltering();
  }
  
  setupEmailTracking() {
    // Observer pour tracker quels emails ont été lus
    const emails = document.querySelectorAll('.email-full');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const emailId = entry.target.id;
          this.markEmailAsRead(emailId);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });
    
    emails.forEach(email => observer.observe(email));
  }
  
  markEmailAsRead(emailId) {
    if (this.readEmails.has(emailId)) return;
    
    this.readEmails.add(emailId);
    
    // Mise à jour visuelle
    const emailElement = document.getElementById(emailId);
    const overviewCard = document.querySelector(`a[href="#${emailId}"]`);
    
    if (emailElement) {
      emailElement.classList.add('email-read');
    }
    
    if (overviewCard) {
      overviewCard.classList.add('card-read');
    }
    
    // Animation de feedback
    this.showReadFeedback(emailElement);
    
    // Tracking pour analytics
    console.log(`[Email] User read email: ${emailId}`);
  }
  
  showReadFeedback(emailElement) {
    if (!emailElement) return;
    
    const feedback = document.createElement('div');
    feedback.innerHTML = '✓';
    feedback.style.cssText = `
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: var(--success-primary);
      color: white;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      animation: slideInUp 0.3s ease-out;
      z-index: 10;
    `;
    
    emailElement.style.position = 'relative';
    emailElement.appendChild(feedback);
    
    // Suppression après animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
          if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
          }
        }, 300);
      }
    }, 2000);
  }
  
  setupEmailAnimations()
