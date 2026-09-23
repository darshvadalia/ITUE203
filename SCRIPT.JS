document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const contactForm = document.getElementById('contactForm');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminConsole = document.getElementById('adminConsole');
  const adminLoginPanel = document.querySelector('.admin-login-panel');
  const staffLoginForm = document.getElementById('staffLoginForm');
  const staffDirectory = document.getElementById('staffDirectory');
  const staffLoginPanel = document.getElementById('staffLoginPanel');
  const navLinks = Array.from(document.querySelectorAll('nav a'));

  const studentLoggedIn = new URLSearchParams(window.location.search).get('student') === '1'
    || localStorage.getItem('charusatStudentLoggedIn') === 'true';

  const adminLoggedIn = new URLSearchParams(window.location.search).get('admin') === '1'
    || localStorage.getItem('charusatAdminLoggedIn') === 'true';

  const staffLoggedIn = new URLSearchParams(window.location.search).get('staff') === '1'
    || localStorage.getItem('charusatStaffLoggedIn') === 'true';

  if (studentLoggedIn) {
    document.body.classList.add('student-authenticated');
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const currentPath = window.location.pathname.split('/').pop();

    if (href && currentPath && href.toLowerCase().endsWith(currentPath.toLowerCase())) {
      link.classList.add('active');
    }
  });

  const pageTitle = document.querySelector('h1') || document.querySelector('h2');
  if (pageTitle) {
    pageTitle.setAttribute('data-page-title', 'true');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const username = document.getElementById('username')?.value.trim();
      const password = document.getElementById('password')?.value.trim();

      if (username && password) {
        localStorage.setItem('charusatStudentLoggedIn', 'true');
        const toast = document.createElement('div');
        toast.className = 'toast success-toast';
        toast.textContent = 'Welcome back! Redirecting to dashboard...';
        document.body.appendChild(toast);
        setTimeout(function () {
          window.location.href = 'DASHBOARD.HTML?student=1';
        }, 700);
      } else {
        alert('Please enter username and password.');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const requiredFields = Array.from(registerForm.querySelectorAll('input[required]'));
      const missing = requiredFields.some((field) => !field.value.trim());

      if (missing) {
        alert('Please complete all registration fields.');
        return;
      }

      const toast = document.createElement('div');
      toast.className = 'toast success-toast';
      toast.textContent = 'Registration submitted successfully!';
      document.body.appendChild(toast);

      setTimeout(function () {
        window.location.href = 'LOGIN.HTML';
      }, 900);
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const requiredFields = Array.from(contactForm.querySelectorAll('input[required], textarea[required], select[required]'));
      const missing = requiredFields.some((field) => !field.value.trim());

      if (missing) {
        alert('Please complete all contact details before sending your message.');
        return;
      }

      const toast = document.createElement('div');
      toast.className = 'toast success-toast';
      toast.textContent = 'Your message has been submitted successfully.';
      document.body.appendChild(toast);

      setTimeout(function () {
        contactForm.reset();
        const toastElement = document.querySelector('.toast.success-toast');
        if (toastElement) {
          toastElement.textContent = 'Thank you. The student support team will contact you soon.';
        }
      }, 800);
    });
  }

  if (adminLoggedIn && adminConsole) {
    adminConsole.hidden = false;
    adminConsole.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (adminLoginPanel) {
      adminLoginPanel.style.display = 'none';
    }

    const adminLayout = document.querySelector('.admin-layout');
    if (adminLayout) {
      adminLayout.style.display = 'block';
    }
  }

  if (staffLoggedIn) {
    if (staffDirectory) {
      staffDirectory.hidden = false;
    }

    if (staffLoginPanel) {
      staffLoginPanel.style.display = 'none';
    }
  }

  if (staffLoginForm) {
    staffLoginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const staffId = document.getElementById('staff-username')?.value.trim();
      const password = document.getElementById('staff-password')?.value.trim();

      if (!staffId || !password) {
        alert('Please enter your staff ID and password.');
        return;
      }

      localStorage.setItem('charusatStaffLoggedIn', 'true');

      const toast = document.createElement('div');
      toast.className = 'toast success-toast';
      toast.textContent = 'Staff login successful. Loading staff directory...';
      document.body.appendChild(toast);

      setTimeout(function () {
        window.location.href = 'STAFF.HTML?staff=1';
      }, 500);
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const username = document.getElementById('admin-username')?.value.trim();
      const password = document.getElementById('admin-password')?.value.trim();

      if (!username || !password) {
        alert('Please enter your admin username and password.');
        return;
      }

      localStorage.setItem('charusatAdminLoggedIn', 'true');

      const toast = document.createElement('div');
      toast.className = 'toast success-toast';
      toast.textContent = 'Admin login successful. Redirecting to student and staff records...';
      document.body.appendChild(toast);

      setTimeout(function () {
        window.location.href = 'ADMIN.HTML?admin=1';
      }, 500);
    });
  }

  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach((item) => {
      const trigger = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (trigger && answer) {
        const isActive = item.classList.contains('active') || trigger.classList.contains('active');
        if (isActive) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }

        trigger.addEventListener('click', function () {
          const parent = trigger.closest('.faq-item');
          const isOpen = parent?.classList.contains('active');

          faqItems.forEach((faqItem) => {
            const question = faqItem.querySelector('.faq-question');
            const questionAnswer = faqItem.querySelector('.faq-answer');
            const itemParent = faqItem.querySelector('.faq-answer');

            if (faqItem !== parent) {
              faqItem.classList.remove('active');
              if (question) question.classList.remove('active');
              if (questionAnswer) questionAnswer.style.maxHeight = null;
            }
          });

          if (isOpen) {
            parent?.classList.remove('active');
            trigger.classList.remove('active');
            answer.style.maxHeight = null;
          } else {
            parent?.classList.add('active');
            trigger.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
        });
      }
    });
  }

  const faqSearch = document.getElementById('faqSearch');
  if (faqSearch) {
    faqSearch.addEventListener('input', function () {
      const query = faqSearch.value.trim().toLowerCase();
      const faqRows = document.querySelectorAll('.faq-item');

      faqRows.forEach((row) => {
        const question = row.querySelector('.faq-question span')?.textContent.trim().toLowerCase() || '';
        const answer = row.querySelector('.faq-answer')?.textContent.trim().toLowerCase() || '';
        const match = question.includes(query) || answer.includes(query);
        row.style.display = match ? 'block' : 'none';
      });
    });
  }

  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('input', function () {
      form.classList.add('is-editing');
    });
  });

  const dashboardCards = document.querySelectorAll('[data-dashboard-card]');
  dashboardCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.classList.add('is-highlighted');
    });
    card.addEventListener('mouseleave', function () {
      card.classList.remove('is-highlighted');
    });
  });
});
