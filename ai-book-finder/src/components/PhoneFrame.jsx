import React from 'react';
import './PhoneFrame.css';

function PhoneFrame({ children }) {
  return (
    <div className="phone-frame-wrapper">
      <div className="phone-frame">
        {children}
      </div>
    </div>
  );
}

export default PhoneFrame;