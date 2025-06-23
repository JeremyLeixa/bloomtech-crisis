/**
 * BLOOMTECH CRISIS SIMULATION
 * JavaScript pour interactions startup modernes
 * Version: 1.0 - FIXED
 */

// ===========================
// CONSTANTS & CONFIGURATION
// ===========================

const CONFIG = {
  BOARD_MEETING_HOURS: 3,
  BOARD_MEETING_MINUTES: 45,
  BOARD_MEETING_SECONDS: 0,
  SCROLL_OFFSET: 120,
  SMOOTH_SCROLL_DURATION: 800,
  TIMER_UPDATE_INTERVAL: 1000
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

function padZero(num) {
  return num.toString().padStart(2, '0');
}

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
  
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  requestAnimationFrame(animation);
}

function handleError(error, context = 'Unknown') {
  console.error(`[BloomTech Crisis] Error in ${context}:`, error);
}

// ===========================
// COUNTDOWN TIMER
// ===========================

class CountdownTimer {
  constructor() {
    this.targetTime = null;
    this.timerInterval = null;
    this.isRunning = false;
    
    this.countdownElement = document.getElementById('countdown');
    this.missionCountdownElement = document.getElementById('mission-countdown');
    this.timerStatusElement = document.querySelector('.timer-status');
    
    this.init();
  }
  
  init() {
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
    this.updateDisplay();
    
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
      
      if (this.countdownElement) {
        const hoursElement = this.countdownElement.querySelector('.time-hours');
        const minutesElement = this.countdownElement.querySelector('.time-minutes');
        const secondsElement = this.countdownElement.querySelector('.time-seconds');
        
        if (hoursElement) hoursElement.textContent = padZero(timeRemaining.hours);
        if (minutesElement) minutesElement.textContent = padZero(timeRemaining.minutes);
        if (secondsElement) secondsElement.textContent = padZero(timeRemaining.seconds);
      }
      
      if (this.missionCountdownElement) {
        this.missionCountdownElement.textContent = 
          `${timeRemaining.hours}h ${padZero(timeRemaining.minutes)}m`;
      }
      
      this.updateUrgencyStyles(timeRemaining);
      
    } catch (error) {
      handleError(error, 'CountdownTimer.updateDisplay');
    }
  }
  
  updateUrgencyStyles(timeRemaining) {
    const totalMinutesLeft = (timeRemaining.hours * 60) + timeRemaining.minutes;
    
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
    
    this.triggerTimeExpiredAlert();
  }
  
  triggerTimeExpiredAlert() {
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
  }
  
  setupSmoothScrolling() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
      e.preventDefault();
      const targetId = link.getAttribute('href');
      
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      smoothScrollTo(targetId);
      console.log(`[Navigation] User navigated to: ${targetId}`);
    });
  }
  
  setupScrollSpy() {
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
  }
  
  setupEmailTracking() {
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
    
    const emailElement = document.getElementById(emailId);
    const overviewCard = document.querySelector(`a[href="#${emailId}"]`);
    
    if (emailElement) {
      emailElement.classList.add('email-read');
    }
    
    if (overviewCard) {
      overviewCard.classList.add('card-read');
    }
    
    this.showReadFeedback(emailElement);
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
  
  setupEmailAnimations() {
    const overviewCards = document.querySelectorAll('.overview-card');
    
    overviewCards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        this.animateCardHover(e.target, true);
      });
      
      card.addEventListener('mouseleave', (e) => {
        this.animateCardHover(e.target, false);
      });
    });
    
    this.setupScrollAnimations();
  }
  
  animateCardHover(card, isEntering) {
    const priority = card.getAttribute('data-priority');
    const priorityElement = card.querySelector('.card-priority');
    
    if (isEntering && priorityElement) {
      priorityElement.style.transform = 'scale(1.1)';
      priorityElement.style.transition = 'transform 0.2s ease-out';
      
      if (priority === 'critical') {
        card.style.boxShadow = '0 8px 32px rgba(255, 107, 107, 0.3)';
      } else if (priority === 'high') {
        card.style.boxShadow = '0 8px 32px rgba(254, 202, 87, 0.3)';
      }
    } else if (priorityElement) {
      priorityElement.style.transform = 'scale(1)';
      card.style.boxShadow = '';
    }
  }
  
  setupScrollAnimations() {
    const emails = document.querySelectorAll('.email-full');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('email-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    emails.forEach(email => {
      email.classList.add('email-animated');
      observer.observe(email);
    });
  }
  
  getReadEmailsCount() {
    return this.readEmails.size;
  }
  
  getUnreadEmailsCount() {
    const totalEmails = document.querySelectorAll('.email-full').length;
    return totalEmails - this.readEmails.size;
  }
}

// ===========================
// PROGRESS TRACKING
// ===========================

class ProgressTracker {
  constructor() {
    this.startTime = new Date();
    this.init();
  }
  
  init() {
    this.createProgressIndicator();
  }
  
  createProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-indicator';
    progressBar.innerHTML = `
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
        <div class="progress-text">
          <span id="progress-emails">0/8</span> emails read
        </div>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      #progress-indicator {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 1rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        min-width: 200px;
        border: 1px solid #e2e8f0;
      }
      .progress-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .progress-bar {
        width: 100%;
        height: 8px;
        background: #edf2f7;
        border-radius: 4px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, #48cae4 0%, #023e8a 100%);
        width: 0%;
        transition: width 0.3s ease-out;
        border-radius: 4px;
      }
      .progress-text {
        font-size: 0.875rem;
        color: #4a5568;
        text-align: center;
        font-weight: 500;
      }
      @media (max-width: 768px) {
        #progress-indicator {
          bottom: 1rem;
          right: 1rem;
          left: 1rem;
          min-width: auto;
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(progressBar);
  }
  
  updateProgress(readCount, totalCount) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-emails');
    
    if (progressFill && progressText) {
      const percentage = (readCount / totalCount) * 100;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${readCount}/${totalCount}`;
      
      if (readCount === totalCount) {
        this.showCompletionMessage();
      }
    }
  }
  
  showCompletionMessage() {
    const completionMessage = document.createElement('div');
    completionMessage.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #48cae4 0%, #023e8a 100%);
        color: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        text-align: center;
        animation: slideInUp 0.5s ease-out;
        max-width: 400px;
      ">
        <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🎉 All Emails Read!</h3>
        <p style="margin: 0; font-size: 1rem;">You've reviewed all crisis emails. Time to analyze and prioritize!</p>
      </div>
    `;
    
    document.body.appendChild(completionMessage);
    
    setTimeout(() => {
      if (completionMessage.parentNode) {
        completionMessage.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
          if (completionMessage.parentNode) {
            completionMessage.parentNode.removeChild(completionMessage);
          }
        }, 500);
      }
    }, 4000);
  }
}

// ===========================
// MAIN APPLICATION
// ===========================

class BloomTechCrisisApp {
  constructor() {
    this.components = {};
    this.isInitialized = false;
    this.init();
  }
  
  async init() {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
      } else {
        this.initializeComponents();
      }
    } catch (error) {
      handleError(error, 'BloomTechCrisisApp.init');
    }
  }
  
  initializeComponents() {
    try {
      console.log('[BloomTech] Initializing crisis simulation...');
      
      this.components.timer = new CountdownTimer();
      this.components.navigation = new NavigationManager();
      this.components.emailManager = new EmailManager();
      this.components.progressTracker = new ProgressTracker();
      
      this.setupComponentInteractions();
      this.updateFooterYear();
      this.addDynamicStyles();
      
      this.isInitialized = true;
      console.log('[BloomTech] Crisis simulation initialized successfully');
      
      window.dispatchEvent(new CustomEvent('bloomtechReady', {
        detail: { app: this, components: this.components }
      }));
      
    } catch (error) {
      handleError(error, 'BloomTechCrisisApp.initializeComponents');
    }
  }
  
  setupComponentInteractions() {
    const originalMarkAsRead = this.components.emailManager.markEmailAsRead.bind(this.components.emailManager);
    this.components.emailManager.markEmailAsRead = (emailId) => {
      originalMarkAsRead(emailId);
      
      const readCount = this.components.emailManager.getReadEmailsCount();
      const totalCount = document.querySelectorAll('.email-full').length;
      this.components.progressTracker.updateProgress(readCount, totalCount);
    };
  }
  
  updateFooterYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
  
  addDynamicStyles() {
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
      .email-animated {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
      }
      
      .email-visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .email-read {
        opacity: 0.8;
      }
      
      .card-read::after {
        content: '✓';
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: #48cae4;
        color: white;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: bold;
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(dynamicStyles);
  }
}

// ===========================
// INITIALIZATION
// ===========================

window.BloomTechApp = new BloomTechCrisisApp();

window.addEventListener('bloomtechReady', (e) => {
  window.emailManager = e.detail.components.emailManager;
  window.progressTracker = e.detail.components.progressTracker;
});

window.addEventListener('error', (e) => {
  handleError(e.error, 'Global Error Handler');
});

console.log('[BloomTech] Crisis Simulation JavaScript loaded successfully');
