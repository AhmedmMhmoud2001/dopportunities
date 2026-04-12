import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import StatisticsSection from '../components/StatisticsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import ServicesSection from '../components/ServicesSection';
import FeaturesSection from '../components/FeaturesSection';
import WorkMethodSection from '../components/WorkMethodSection';
import ConsultantSection from '../components/ConsultantSection';
import TestimonialsSection from '../components/TestimonialsSection';
import BranchesSection from '../components/BranchesSection';
import AnimatedSection from '../components/AnimatedSection';
import { useNavigate } from 'react-router-dom';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

function HomePage() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/signup');
  };

  return (
    <div className="app">
      <div className="app-background"></div>
      <Header 
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={handleRegisterClick}
      />
      
      <main className="main-content page-enter">
        <AnimatedSection animationType="fade-in-up" delay={0}>
          <HeroSection />
        </AnimatedSection>
        <AnimatedSection animationType="fade-in-up" delay={100}>
          <StatisticsSection />
        </AnimatedSection>
        <AnimatedSection animationType="fade-in-up" delay={200}>
          <HowItWorksSection />
        </AnimatedSection>
        <AnimatedSection animationType="fade-in-up" delay={100}>
          <ServicesSection />
        </AnimatedSection>
        <AnimatedSection animationType="fade-in-up" delay={200}>
          <FeaturesSection />
        </AnimatedSection>
        <AnimatedSection animationType="fade-in-up" delay={100}>
          <WorkMethodSection />
        </AnimatedSection>
        <AnimatedSection animationType="fade-in-up" delay={200}>
          <ConsultantSection />
        </AnimatedSection>
        <AnimatedSection animationType="fade-in-up" delay={100}>
          <TestimonialsSection />
        </AnimatedSection>
        <AnimatedSection animationType="fade-in-up" delay={200}>
          <BranchesSection />
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;

