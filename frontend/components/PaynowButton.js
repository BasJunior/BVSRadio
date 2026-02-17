// Paynow Payment Button Component
import React from 'react';

export default function PaynowButton({ product, userEmail = 'abiaschivayo@gmail.com' }) {
    // Generate Paynow payment link
    // The link format from the example: 
    // https://www.paynow.co.zw/Payment/Link/?q=c2VhcmNoPWFiaWFzY2hpdmF5byU0MGdtYWlsLmNvbSZhbW91bnQ9OS45NSZyZWZlcmVuY2U9Jmw9MQ%3d%3d
    // This appears to be base64 encoded parameters
    
    const generatePaynowLink = () => {
        // Create the query parameters
        const params = `search=${encodeURIComponent(userEmail)}&amount=${product.price}&reference=${product.id || ''}&l=1`;
        
        // Base64 encode the parameters
        const encodedParams = btoa(params);
        
        // Construct the Paynow URL
        return `https://www.paynow.co.zw/Payment/Link/?q=${encodedParams}`;
    };

    const paynowLink = generatePaynowLink();

    return (
        <a 
            href={paynowLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2"
        >
            <img 
                src="https://www.paynow.co.zw/Content/Buttons/Medium_buttons/button_pay-now_medium.png"
                alt="Pay with Paynow"
                className="h-10 hover:opacity-90 transition-opacity"
            />
        </a>
    );
}
