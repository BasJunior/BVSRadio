# Paynow Payment Integration Guide

## Overview

BVSRadio now supports Paynow payment integration for all Wolf Beat Pack and Mixtape products. Paynow is Zimbabwe's leading payment platform that allows customers to pay using multiple payment methods.

## Features

- **Direct Payment Links**: Each product has a "Pay with Paynow" button that redirects to Paynow's secure payment gateway
- **Multiple Payment Methods**: Customers can pay using:
  - Ecocash
  - OneMoney
  - Telecash
  - Visa & Mastercard
- **Automatic Link Generation**: Payment links are automatically generated with product information

## How It Works

### For Customers

1. Browse products on the store page at `/store`
2. Select a Wolf Beat Pack or Mixtape product
3. Click the "Pay with Paynow" button below the product
4. You'll be redirected to Paynow's secure payment page
5. Complete your payment using your preferred method
6. Return to BVSRadio after successful payment

### For Developers

The Paynow integration is implemented through the `PaynowButton` component:

```javascript
import PaynowButton from '../components/PaynowButton';

// Use in any component
<PaynowButton product={product} userEmail="customer@email.com" />
```

#### Component Props

- `product` (required): Product object with `id`, `price`, and other details
- `userEmail` (optional): Customer email for payment tracking (defaults to 'abiaschivayo@gmail.com')

#### Payment Link Format

The component generates Paynow payment links with the following parameters:
- `search`: Customer email address
- `amount`: Product price
- `reference`: Product ID for tracking
- `l`: Link type (always set to 1)

Example generated link:
```
https://www.paynow.co.zw/Payment/Link/?q=c2VhcmNoPWN1c3RvbWVyJTQwZW1haWwuY29tJmFtb3VudD05Ljk1JnJlZmVyZW5jZT0xJmw9MQ==
```

## Store Page Features

The store page (`/pages/store.js`) includes:

1. **Product Catalog**: Displays all available products
2. **Category Filtering**: Filter by "All Products", "Wolf Beat Pack", or "Mixtape"
3. **Product Information**: Shows name, description, price, and stock status
4. **Paynow Integration**: Automatic payment buttons for Wolf Beat Pack and Mixtape products
5. **Shopping Cart**: Traditional "Add to Cart" functionality
6. **Responsive Design**: Works on all device sizes

## Setup Instructions

### 1. Database Setup

Run the product seed script to populate your database with sample products:

```bash
cd backend
psql -d bvsradio -f migrations/002_seed_products.sql
```

### 2. Frontend Setup

Install dependencies including Tailwind CSS:

```bash
cd frontend
npm install
```

### 3. Run the Application

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend (in a separate terminal):
```bash
cd frontend
npm run dev
```

Access the store at: `http://localhost:3001/store`

## Product Categories

### Wolf Beat Pack
Premium beat collections for music producers and artists:
- Vol. 1 through Vol. 3
- Specialized editions (Trap, Lo-Fi)
- Includes commercial licenses

### Mixtape
Curated music collections:
- Genre-specific compilations
- Themed collections (Summer, Late Night, Workout)
- Featured local and international artists

## Payment Flow

1. **Product Selection**: Customer browses and selects a product
2. **Payment Initiation**: Clicks "Pay with Paynow" button
3. **Paynow Gateway**: Redirected to secure Paynow payment page
4. **Payment Processing**: Customer completes payment with chosen method
5. **Confirmation**: Paynow processes and confirms payment
6. **Return**: Customer returns to BVSRadio

## Security Considerations

- All payments are processed through Paynow's secure gateway
- No sensitive payment information is stored on BVSRadio servers
- Payment links are generated client-side with base64 encoding
- All communication with Paynow uses HTTPS

## Customization

### Changing Default Email

To use a different email for payment tracking, modify the `PaynowButton` component:

```javascript
<PaynowButton product={product} userEmail="your-email@domain.com" />
```

### Adding Paynow to Other Products

To enable Paynow payments for other product categories, update the condition in `ProductCard.js`:

```javascript
{showPaynow && product.stock_quantity > 0 && (
    product.category === 'Wolf Beat Pack' || 
    product.category === 'Mixtape' ||
    product.category === 'Your New Category'
) && (
    <PaynowButton product={product} />
)}
```

## Testing

1. Navigate to `/store`
2. Verify products are displayed correctly
3. Click on a "Pay with Paynow" button
4. Confirm you're redirected to Paynow's payment page
5. Verify the amount and reference are correct

## Troubleshooting

### Products Not Showing
- Ensure the database is seeded with products
- Check that the backend API is running on port 3000
- Verify the API endpoint in `store.js` matches your backend URL

### Payment Button Not Appearing
- Verify the product category is "Wolf Beat Pack" or "Mixtape"
- Check that the product has stock available
- Ensure `showPaynow` prop is true (default)

### Payment Link Invalid
- Verify the product has a valid price
- Check the base64 encoding is working correctly
- Ensure all URL parameters are properly encoded

## Future Enhancements

- [ ] Payment webhook integration for automatic order fulfillment
- [ ] Payment status tracking
- [ ] Order history with Paynow payment records
- [ ] Email notifications after successful payment
- [ ] Customizable payment success/failure pages

## Support

For issues or questions about Paynow integration:
- Check the [Paynow documentation](https://www.paynow.co.zw)
- Open an issue on the BVSRadio GitHub repository
- Contact the development team

## References

- [Paynow Website](https://www.paynow.co.zw)
- [BVSRadio GitHub](https://github.com/BasJunior/BVSRadio)
