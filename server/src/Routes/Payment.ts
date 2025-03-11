import Stripe from "stripe";
import { Request, Response } from "express";
import express from 'express'
import { Item } from "../Interfaces/itemInterface";
import { CartItem } from "../Interfaces/userInterface";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_KEY = process.env.STRIPE_SECRET
const stripe = new Stripe(STRIPE_KEY || '')

const router = express.Router()

const fulfillCheckout = async (sessionId: string) => {
    // Retrieve the Checkout Session from the API with line_items expanded
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
    })
    console.log('Checkout info?: ', checkoutSession)
// Check the Checkout Session's payment_status property
  // to determine if fulfillment should be peformed
  if (checkoutSession.payment_status !== 'unpaid') {
    // TODO: Perform fulfillment of the line items

    // TODO: Record/save fulfillment status for this
    // Checkout Session
  }
}
router.post('/checkout', async(req: Request, res: Response) : Promise<any> => {
    const {items} = req.body
    
    const cartItems: CartItem[] = items
    
    try{
        const session = await stripe.checkout.sessions.create({
            line_items: cartItems.map((currItem) => ({
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: currItem.item.name,
                        description: currItem.item.description,
                        images: currItem.item.photos?.length ? [currItem.item.photos[0]] : [],
                    },
                    unit_amount: currItem.item.price * 100,
                },
                quantity: currItem.quantity
            })),
            customer_creation: "always",
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'],  // Ask for full shipping address
            },
            mode: 'payment',
            success_url: 'http://localhost:3000/?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000/?success=false',  
        })

        if(session.url === null) {
            return res.status(404).json("Stripe error, please try again.")
        }

        return res.status(200).json({url: session.url})
    } catch(error) {
        res.status(500).json(`Internal server error: ${error}`)
    }
})

router.post('/webhook',express.raw({type: 'application/json'}), async (request, response) : Promise<any> => {
    const sig = request.headers['stripe-signature'];
    if(!sig) return response.status(404).json('Sig not provided')

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
    console.error('error: ', err)
      return response.status(400).send(`Webhook Error: ${err}`);
    }

    if (
      event.type === 'checkout.session.completed'
      || event.type === 'checkout.session.async_payment_succeeded'
    ) {
        const session = event.data.object
        const customerId = session.customer
        const amountPaid = session.amount_total
        const currencyType = session.currency
        console.log('Amount paid', amountPaid)
        console.log('Currency Type', currencyType)
        if(typeof customerId !== 'string') {
            return response.status(404).json("Billing system error with fetching customer")
        }

        try{
            const customer = await stripe.customers.retrieve(customerId)
            console.log(`Customer info`, customer)
        } catch(error) {
            console.error("Error retrieving customer: ", error)
            return response.status(500).json(`Internal server error: ${error}`)
        }
    }
  
    return response.status(200).end();
  });

export default router