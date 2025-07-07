import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

const ArmenianUIEnhancer = () => {
  const { language } = useLanguage();

  useEffect(() => {
    if (language === 'hy') {
      // Apply Armenian-specific UI enhancements
      document.documentElement.setAttribute('lang', 'hy');
      document.documentElement.style.setProperty('--armenian-font-active', '1');
      
      // Enhanced text rendering for Armenian
      const style = document.createElement('style');
      style.id = 'armenian-ui-enhancements';
      style.textContent = `
        body[lang="hy"] {
          font-family: 'Noto Sans Armenian', 'Arial Armenian', 'Sylfaen', 'Arial Unicode MS', sans-serif !important;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        [lang="hy"] .hero-title {
          font-size: 1.1em;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        
        [lang="hy"] .card-title {
          font-size: 1.05em;
          font-weight: 600;
          line-height: 1.4;
        }
        
        [lang="hy"] .nav-link {
          font-size: 0.95em;
          font-weight: 500;
          letter-spacing: 0.005em;
        }
        
        [lang="hy"] .button-text {
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        
        [lang="hy"] .description-text {
          line-height: 1.75;
          font-size: 1.02em;
        }
        
        /* Better spacing for Armenian text */
        [lang="hy"] .text-spacing {
          word-spacing: 0.1em;
          letter-spacing: 0.01em;
        }
        
        /* Improved button padding for Armenian text */
        [lang="hy"] .btn {
          padding-left: 1.3rem;
          padding-right: 1.3rem;
          padding-top: 0.65rem;
          padding-bottom: 0.65rem;
        }
        
        /* Enhanced readability for longer Armenian text */
        [lang="hy"] .long-text p {
          margin-bottom: 1.5em;
          line-height: 1.8;
        }
      `;
      
      // Remove existing style if it exists
      const existingStyle = document.getElementById('armenian-ui-enhancements');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      // Add Armenian-specific classes to key elements
      const addArmenianClasses = () => {
        // Hero sections
        document.querySelectorAll('h1, h2, h3').forEach(el => {
          if (el.textContent && /[\u0530-\u058F]/.test(el.textContent)) {
            el.classList.add('hero-title');
          }
        });
        
        // Cards and titles
        document.querySelectorAll('.card h3, .card h4').forEach(el => {
          if (el.textContent && /[\u0530-\u058F]/.test(el.textContent)) {
            el.classList.add('card-title');
          }
        });
        
        // Navigation links
        document.querySelectorAll('nav a, .nav-link').forEach(el => {
          if (el.textContent && /[\u0530-\u058F]/.test(el.textContent)) {
            el.classList.add('nav-link');
          }
        });
        
        // Buttons
        document.querySelectorAll('button, .btn').forEach(el => {
          if (el.textContent && /[\u0530-\u058F]/.test(el.textContent)) {
            el.classList.add('button-text');
          }
        });
        
        // Descriptions and paragraphs
        document.querySelectorAll('p').forEach(el => {
          if (el.textContent && /[\u0530-\u058F]/.test(el.textContent)) {
            el.classList.add('description-text', 'text-spacing');
            if (el.textContent.length > 100) {
              el.classList.add('long-text');
            }
          }
        });
      };
      
      // Apply classes immediately and on DOM changes
      addArmenianClasses();
      
      // Observe DOM changes for dynamic content
      const observer = new MutationObserver(() => {
        addArmenianClasses();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      return () => {
        observer.disconnect();
      };
    } else {
      // Clean up Armenian enhancements when switching languages
      document.documentElement.removeAttribute('lang');
      document.documentElement.style.removeProperty('--armenian-font-active');
      
      const existingStyle = document.getElementById('armenian-ui-enhancements');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Remove Armenian-specific classes
      document.querySelectorAll('.hero-title, .card-title, .nav-link, .button-text, .description-text, .text-spacing, .long-text').forEach(el => {
        el.classList.remove('hero-title', 'card-title', 'nav-link', 'button-text', 'description-text', 'text-spacing', 'long-text');
      });
    }
  }, [language]);

  return null; // This component doesn't render anything visible
};

export default ArmenianUIEnhancer;