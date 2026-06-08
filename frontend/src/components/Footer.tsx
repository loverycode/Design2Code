import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps>= ({className})=>{
    return(
        <footer className={`bg-white border-t py-6 ${className || ''}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
                Supported by Design2Code
            </p>
        </div>
    </footer>
    );
}

export default Footer;