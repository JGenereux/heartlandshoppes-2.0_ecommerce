import Stripe from "stripe";
import { Request, Response } from "express";
import express from 'express'
import { Item } from "../Interfaces/itemInterface";
import { CartItem } from "../Interfaces/userInterface";
import { ItemInvoice, Order } from "../Interfaces/orderInterface";
import axios from "axios";
const { parseStringPromise } = require('xml2js');
import { Orders } from "../Models/Order";
import { Users } from "../Models/User";
import { client } from "../../redis-client";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_KEY = process.env.STRIPE_SECRET
const stripe = new Stripe(STRIPE_KEY || '')

const router = express.Router()

router.post('/checkout', async(req: Request, res: Response) : Promise<any> => {
    const {items} = req.body
    
    const cartItems: CartItem[] = items
    
    try{
        const session = await stripe.checkout.sessions.create({
            line_items: cartItems.map((currItem) => {                
                return {
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: `${currItem.item.name} - ${Object.entries(currItem.item.options)
                                .map(([key, values]) => `${key}: ${values.join(', ')}`)
                                .join(' | ')}`,
                            description: currItem.item.description,
                            images: currItem.item.photos?.length ? [currItem.item.photos[0]] : [],
                        },
                        unit_amount: currItem.item.price * 100,
                    },
                    quantity: currItem.quantity,
                };
            }),
            customer_creation: "always",
            invoice_creation: { enabled: true },
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'],  
            },
            shipping_options: [
                {
                  shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                      amount: 2200,
                      currency: 'cad',
                    },
                    display_name: 'Standard Shipping',
                    delivery_estimate: {
                      minimum: { unit: 'business_day', value: 3 },
                      maximum: { unit: 'business_day', value: 7 },
                    },
                  },
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/?success=false`, 
        })

        if(session.url === null) {
            return res.status(404).json("Stripe error, please try again.")
        }

        return res.status(200).json({url: session.url})
    } catch(error) {
        console.error('Stripe checkout error:', error);
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

    if(event.type === 'invoice.finalized') {
        const invoice = event.data.object
     
        try {
            const detailedInvoice = await stripe.invoices.retrieve(invoice.id, {
                expand: ['lines.data']
            });

            if(!detailedInvoice) {
                return response.status(413).json(`Error fetching detailed invoice from stripe`)
            }

            const invoiceID = detailedInvoice.id
            let invoiceItems: ItemInvoice[] = []
            detailedInvoice.lines.data.forEach((item) => {
                const {description, price, quantity, metadata} = item
                const newItemInvoice: ItemInvoice = {
                    description: description || '',
                    amount: price?.unit_amount || 0,
                    quantity: quantity || 0,
                }
              
                invoiceItems.push(newItemInvoice)
            })
            
            if(!invoiceItems || invoiceItems.length === 0) {
                return response.status(401).json('Error fetching items for invoice')
                
            }

            if(!detailedInvoice.customer_shipping || !detailedInvoice.customer_email || !detailedInvoice.customer_name) {
                return response.status(403).json('Error retrieving full details for order')
            }
           
            const newOrder = new Orders({items: invoiceItems, totalPrice: invoice.amount_paid || 0, billingInfo: {
                fullName: detailedInvoice.customer_name || '',
                address: detailedInvoice.customer_shipping?.address?.line1 || detailedInvoice.customer_shipping?.address?.line2 || '',
                country: detailedInvoice.customer_shipping?.address?.country || '',
                province: detailedInvoice.customer_shipping?.address?.state || "",
                city: detailedInvoice.customer_shipping?.address?.city || "",
                postalCode: detailedInvoice.customer_shipping?.address?.postal_code || "",
                email: detailedInvoice.customer_email || '',
                phone: detailedInvoice.customer_shipping?.phone || null,
            }, status: "added", trackingNumber: null, date: new Date(Date.now()), invoiceUrl: detailedInvoice.hosted_invoice_url || ''})
            
            await newOrder.save()

            //reset users cart
            const user = await Users.findOneAndUpdate({email: newOrder.billingInfo.email}, { $set: { cart: [] } }, {new: true})
            if(!user) {
                return response.status(417).json("Error resetting user's cart")
            }

            // push newOrder onto orders cache
            await client.sendCommand(["LPUSH", "orders", JSON.stringify(newOrder)])
            await client.sendCommand(["EXPIRE", "orders", "1000"])

            return response.status(200).json(newOrder)
        } catch (error) {
            console.error('Error adding invoice details:', error);
        }
    }
  
    return response.status(200).end();
});

export default router
