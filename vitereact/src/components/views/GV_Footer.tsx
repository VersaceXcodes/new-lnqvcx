import React from 'react';
import { Link, useHistory } from 'react-router-dom';

const GV_Footer: React.FC = () => {
  const history = useHistory();

  const sendFeedback = () => {
    history.push('/feedback');
  };

  const navigateToTerms = () => {
    history.push('/terms');
  };

  const navigateToPrivacyPolicy = () => {
    history.push('/privacy');
  };

  const contactUs = () => {
    history.push('/contact');
  };

  return (
    <footer className="bg-gray-800 text-white py-4 fixed bottom-0 left-0 w-full">
      <div className="container mx-auto flex justify-around text-sm">
        <Link to="/about" className="hover:underline">
          About Us
        </Link>
        <button type="button" onClick={contactUs} className="hover:underline">
          Contact Us
        </button>
        <button type="button" onClick={sendFeedback} className="hover:underline">
          Feedback/Report Issues
        </button>
        <button type="button" onClick={navigateToTerms} className="hover:underline">
          Terms of Service
        </button>
        <button type="button" onClick={navigateToPrivacyPolicy} className="hover:underline">
          Privacy Policy
        </button>
      </div>
    </footer>
  );
};

export default GV_Footer;