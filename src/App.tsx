import { useState, useEffect } from 'react';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Footer from './components/Footer';
import IntroAnimation from './components/IntroAnimation';
import CatchABreak from './components/CatchABreak';
import EditorialGallery from './components/EditorialGallery';
import ViewMenuCTA from './components/ViewMenuCTA';
import ContactSection from './components/ContactSection';
import SiteFooter from './components/SiteFooter';
import WhatsAppButton from './components/WhatsAppButton';
import ColdDrinksPage from './components/ColdDrinksPage';

type Route = 'home' | 'menu' | 'cold-drinks';

function parseRoute(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === '/menu') return 'menu';
  if (hash === '/menu/cold-drinks') return 'cold-drinks';
  return 'home';
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [route, setRoute] = useState<Route>(parseRoute);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to: Route) => {
    if (to === 'home' && route === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (to === 'menu') window.location.hash = '/menu';
    else if (to === 'cold-drinks') window.location.hash = '/menu/cold-drinks';
    else window.location.hash = '/';
  };

  const scrollToBooking = () => {
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const contact = document.getElementById('contact');
      if (contact) contact.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <div className="relative min-h-screen bg-stone-100">
        <Background />
        {route !== 'cold-drinks' && <Navbar navigate={navigate} route={route} />}
        <main className="relative z-10">
          {route === 'menu' ? (
            <Menu onBack={() => navigate('home')} onColdDrinks={() => navigate('cold-drinks')} />
          ) : route === 'cold-drinks' ? (
            <ColdDrinksPage navigate={navigate} />
          ) : (
            <>
              <Hero onViewMenu={() => navigate('menu')} />
              <CatchABreak onBook={scrollToBooking} />
              <EditorialGallery />
              <ViewMenuCTA onViewMenu={() => navigate('menu')} />
              <ContactSection />
            </>
          )}
        </main>
        {route === 'menu' ? (
          <Footer navigate={navigate} />
        ) : route === 'cold-drinks' ? (
          <Footer navigate={navigate} />
        ) : (
          <SiteFooter navigate={navigate} onBook={scrollToBooking} />
        )}
        <WhatsAppButton />
      </div>
    </>
  );
}
