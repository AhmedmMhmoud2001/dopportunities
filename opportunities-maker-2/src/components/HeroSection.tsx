import './HeroSection.css';
import left from '../assets/images/hero_section_left.png';
import right from '../assets/images/hero_section_right.png';

function HeroSection() {
  return (
    <section className="hero-section" id="home">
      <div className="container">
        <div className="hero-content">
          {/* Right Column - Text and Buttons */}
          <div className="hero-text">
            <div className="hero-text-background">
              <img 
                src={right} 
                alt="Background pattern" 
                className="hero-background-img"
              />
            </div>
            <div className="hero-text-content">
              <h1 className="hero-title">
                أسّس شركتك في السعودية بدون كفيل
              </h1>
              <p className="hero-description">
                نستخرج لك الترخيص الاستثماري السعودي سواء الخدمي أو التجاري أو الصناعي أو النقل, وكذلك في سلطنة عمان
              </p>
              <div className="hero-buttons">
              <a href="/contact" className="hero-button hero-button-primary">
                  <span className="button-text">ابدأ الآن</span>
                  <div className="button-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 5v14l-11-7z" fill="currentColor"/>
                    </svg>
                  </div>
                </a>
                <a
                  href="/contact/track"
                  className="hero-button hero-button-primary"
                  rel="noopener noreferrer"
                >
                  <span className="button-text">متابعة طلبك</span>
                  <div className="button-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 5v14l-11-7z" fill="currentColor"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Left Column - Image */}
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <img 
                src={left} 
                alt="Hero illustration" 
                className="hero-image-img"
              />
              <div className="hero-image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
