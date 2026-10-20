import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();

  const services = [
    { title: 'Home Affairs', desc: 'Passports, identity documents, civil registration and more.', link: '/login' },
    { title: 'Traffic & Transport', desc: 'Driving licences, vehicle registration and transport permits.', link: '/login' },
    { title: 'Police Services', desc: 'Police clearance, reports and public safety information.', link: '/login' },
    { title: 'Finance & Pensions', desc: 'Government payments, funding and pension services.', link: '/login' },
  ];

  return (
    <div className="welcome-page-container">
      <header className="welcome-header">
        <div className="header-left">
          
          {/* Replaced the LS text with the actual Logo.jpeg */}
          <img 
            src="/Logo.jpeg" 
            alt="Lesotho Coat of Arms" 
            className="logo-circle" 
          />
          
          <div>
            <h2 style={{ margin: 0, color: '#1A5276', fontSize: '1.2rem' }}>Integrated Government Services</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Government of Lesotho</p>
          </div>
        </div>
        <div className="header-right">
          <button className="lang-btn active">EN</button>
          <button className="lang-btn">ST</button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-label">WELCOME TO THE</span>
          <h1 className="hero-title">Integrated Government<br/>Services System</h1>
          <p className="hero-desc">
            Access essential public services, submit applications, track requests, and stay informed — all in one secure digital platform.
          </p>
          <p className="hero-tags">Simple &nbsp;|&nbsp; Secure &nbsp;|&nbsp; Convenient</p>
          <button className="btn-primary-hero" onClick={() => navigate('/login')}>
            Explore Services &rarr;
          </button>
        </div>
        <div className="hero-image">
          <img src="/background.jpg" alt="national flag" />
        </div>
      </section>

      <section className="services-section">
        <h2 className="services-title">Services at Your Fingertips</h2>
        <p className="services-subtitle">Choose from a wide range of government services provided by different ministries and departments.</p>
        
        <div className="services-grid-welcome">
          {services.map((s, idx) => (
            <div key={idx} className="service-card-welcome" onClick={() => navigate(s.link)}>
              <div className="service-img-placeholder">
                <span>{s.title}</span>
              </div>
              <div className="service-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="learn-more">Learn more &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}