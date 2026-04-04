# Recurring Payments

## Setting Up Recurring Payments

Nova supports recurring payments for bills, subscriptions, and scheduled transfers.

**To set up a recurring payment:**
1. Go to Pay Bills or Send Money
2. Enter the recipient details and amount
3. Toggle "Make this recurring"
4. Select the frequency: Weekly, Bi-weekly, Monthly, or Custom
5. Set the start date and optional end date
6. Confirm and save

## Managing Recurring Payments

View and manage all recurring payments at Settings > Recurring Payments.

For each recurring payment, you can:
- **Pause:** Temporarily stop the payment without deleting it. Resume anytime.
- **Edit:** Change the amount, frequency, or recipient details.
- **Cancel:** Permanently stop the recurring payment. Any pending scheduled payment will still process unless cancelled individually.
- **View history:** See all past payments in this recurring series.

## Subscription Detection

Nova automatically detects recurring charges from merchants (like Netflix, Spotify, gym memberships, etc.) and groups them under Transactions > Subscriptions. This helps you track all your recurring expenses in one place.

**Subscription insights include:**
- Total monthly spend on subscriptions
- List of all detected recurring charges
- Alerts when a subscription price increases
- Reminder when a free trial is about to end

## Failed Recurring Payments

If a recurring payment fails (insufficient funds, expired card, etc.):
- You'll receive a push notification and email alert
- Nova will automatically retry the payment once the next business day
- If the retry also fails, the recurring payment is paused and you'll be notified
- No late fees are charged by Nova (though the payee may charge their own late fees)

## Limits

You can have up to 50 active recurring payments. Recurring payments are subject to the same transfer limits as one-time payments.
