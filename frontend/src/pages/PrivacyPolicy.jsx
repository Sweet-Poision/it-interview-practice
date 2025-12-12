import React from 'react';
import '../App.css';

const PrivacyPolicy = () => {
    return (
        <div className="page-container animate-fade-up">
            <div className="glass-panel text-content">
                <h1 className="title-large" style={{ marginBottom: '1rem' }}>Privacy Policy</h1>
                <p className="subtitle" style={{ marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose">
                    <section>
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to Practice Plan. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2>2. Data Collection</h2>
                        <p>
                            We prioritize data minimization. We do not collect any personal data that is not absolutely necessary
                            for the functionality of the service. Currently, we may collect:
                        </p>
                        <ul>
                            <li>Usage data (e.g., session duration, difficulty preferences) to improve your experience.</li>
                            <li>Technical data (e.g., browser type, device info) for compatibility purposes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Security</h2>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
                            used, or accessed in an unauthorized way. We limit access to your personal data to those employees, agents,
                            contractors, and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2>4. Contact Us</h2>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us via our GitHub or LinkedIn profiles linked in the footer.
                        </p>
                    </section>
                </div>
            </div>

            <style>{`
        .page-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 0;
        }
        
        .text-content {
          padding: 3rem;
          text-align: left;
        }

        .prose section {
          margin-bottom: 2.5rem;
        }

        .prose h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .prose p, .prose li {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .prose ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
           .text-content {
              padding: 1.5rem;
           }
        }
      `}</style>
        </div>
    );
};

export default PrivacyPolicy;
