function PrivacyPolicy() {
  return (
    <div className="main-content fade-in" style={{ paddingTop: '5rem' }}>
      <div className="glass-box p-4" style={{ maxWidth: '800px', margin: '0 auto', color: '#000' }}>
        <h1 className="mb-3">Privacy Policy</h1>
        <p className="mb-2">Last Updated: March 2026</p>
        
        <div className="mt-4">
          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us when you create an account, submit a complaint (including photos and location), and communicate with us.</p>
        </div>

        <div className="mt-3">
          <h3>2. How We Use Your Information</h3>
          <p>We use the information we collect to provide, maintain, and improve our services, including to process and respond to city complaints.</p>
        </div>

        <div className="mt-3">
          <h3>3. Sharing of Information</h3>
          <p>Your complaint data (location, description, photos) is shared with city administrators to facilitate resolution. Personal contact info is kept private.</p>
        </div>

        <div className="mt-3">
          <h3>4. Security</h3>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.</p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
