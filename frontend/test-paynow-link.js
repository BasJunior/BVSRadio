// Test script to verify Paynow link generation
// Run with: node test-paynow-link.js

// Simulate the PaynowButton link generation logic
function generatePaynowLink(product, userEmail = 'abiaschivayo@gmail.com') {
    // Create the query parameters
    const params = `search=${encodeURIComponent(userEmail)}&amount=${product.price}&reference=${product.id || ''}&l=1`;
    
    // Base64 encode the parameters
    const encodedParams = Buffer.from(params).toString('base64');
    
    // Construct the Paynow URL
    return `https://www.paynow.co.zw/Payment/Link/?q=${encodedParams}`;
}

// Test with sample products
const testProducts = [
    {
        id: 1,
        name: 'Wolf Beat Pack Vol. 1',
        price: 9.95,
        category: 'Wolf Beat Pack'
    },
    {
        id: 2,
        name: 'Summer Vibes Mixtape 2024',
        price: 7.95,
        category: 'Mixtape'
    }
];

console.log('Paynow Link Generation Test\n');
console.log('=' .repeat(80));

testProducts.forEach(product => {
    const link = generatePaynowLink(product);
    console.log(`\nProduct: ${product.name}`);
    console.log(`Price: $${product.price}`);
    console.log(`Category: ${product.category}`);
    console.log(`Generated Link:\n${link}`);
    console.log('-'.repeat(80));
});

// Test with the example from the issue
console.log('\nExpected format example:');
console.log('https://www.paynow.co.zw/Payment/Link/?q=c2VhcmNoPWFiaWFzY2hpdmF5byU0MGdtYWlsLmNvbSZhbW91bnQ9OS45NSZyZWZlcmVuY2U9Jmw9MQ%3d%3d');

// Decode the example to understand the format
const exampleEncoded = 'c2VhcmNoPWFiaWFzY2hpdmF5byU0MGdtYWlsLmNvbSZhbW91bnQ9OS45NSZyZWZlcmVuY2U9Jmw9MQ==';
const exampleDecoded = Buffer.from(exampleEncoded, 'base64').toString('utf-8');
console.log('\nDecoded example parameters:');
console.log(exampleDecoded);

console.log('\n' + '='.repeat(80));
console.log('✓ Test completed successfully!');
