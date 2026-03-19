import "./Home.css"; // Reuse glass styles or create a specific one if needed

function Support() {
  return (
    <div className="main-content fade-in" style={{ paddingTop: '5rem' }}>
      <div className="glass-box p-4" style={{ maxWidth: '800px', margin: '0 auto', color: '#000' }}>
        <h1 className="mb-3">City Support Center</h1>
        <p className="mb-4">We're here to help you make our city better. If you have any technical issues or questions about reporting, please reach out.</p>
        
        <div className="mb-4">
          <h3>Contact Us</h3>
          <p>📧 Email: support@smartcitymapper.com</p>
          <p>📞 Phone: +1 (555) 123-4567</p>
          <p>⏱️ Hours: Mon - Fri, 9:00 AM - 6:00 PM</p>
        </div>

        <div>
          <h3>Frequently Asked Questions</h3>
          <div className="mt-2">
            <strong>How long does it take to resolve a complaint?</strong>
            <p>Typically 3-5 business days depending on the priority and category.</p>
          </div>
          <div className="mt-2">
            <strong>Can I track my complaint status?</strong>
            <p>Yes, all your submissions are visible and tracked in your User Dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
