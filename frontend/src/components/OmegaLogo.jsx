import React from 'react';

const OmegaLogo = ({ size = 64 }) => {
    return (
        <div 
            className="omega-logo-container" 
            style={{ width: size, height: size, fontSize: size * 0.6 }}
        >
            <div className="omega-glow"></div>
            <span className="omega-symbol">Ω</span>
        </div>
    );
};

export default OmegaLogo;
