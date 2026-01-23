import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe"
import User from "../models/User.js";


// Place Order Stripe: /api/order/stripe
export const PlaceOrderStripe = async (req,res)=>{
    try {
        const { userId, items, address } = req.body;
        const {origin} = req.headers;

    if(!address || items.length === 0 ){
            return res.json({success: false, message: "Invalid Data"})
        }

        let productData = [];

        //Calculate Amount Using items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (10%)
        amount += Math.floor(amount * 0.10);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
        });

        // stripe getway initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //create line items for stripe

        const line_items = productData.map((item)=>{
            return {
                price_data: {
                    currency: "bdt",
                    product_data:{
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.10) * 100
                },
                quantity: item.quantity,
            }
        })

        //create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })
        
        return res.json({success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
        
    }
}

//  Stripe webhooks to verify payment action : /stripe
export const stripeWebhooks = async (request, response)=>{
    //Stripe gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;
    
    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`)
    }
    // handle the event
    switch (event.type) {
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const {orderId, userId} = session.data[0].metadata;

            // Mark payment as paid 

            await Order.findByIdAndUpdate(orderId, {isPaid: true})
            // clear user Data
            await User.findByIdAndUpdate(userId, {cartItems: {}});
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const {orderId} = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }
            
    
        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    response.json({received: true})
}



// Place Order COD: /api/order/cod
export const PlaceOrderCOD = async (req,res)=>{
    try {
        const { userId, items, address } = req.body;
    if(!address || items.length === 0 ){
            return res.json({success: false, message: "Invalid Data"})
        }
        //Calculate Amount Using items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (10%)
        amount += Math.floor(amount * 0.10);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        })
        
        return res.json({success: true, message: "Order Placed Successfully"})
    } catch (error) {
        return res.json({ success: false, message: error.message });
        
    }
}


// Get Order by User ID: /api/order/user
export const getUserOrder = async (req, res)=>{
    try {
        const { userId } = req.body;
        const orders = await Order.find ({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


//Get All orders (for seller / admin ) : /api/order/seller
export const getAllOrders = async (req, res)=>{
    try {
        const orders = await Order.find ({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update Payment Status (for seller / admin ) : /api/order/update-payment
export const updatePaymentStatus = async (req, res)=>{
    try {
        const { orderId, isPaid } = req.body;
        
        if (!orderId) {
            return res.json({ success: false, message: "Order ID is required" });
        }
        
        await Order.findByIdAndUpdate(orderId, { isPaid });
        res.json({ success: true, message: `Payment marked as ${isPaid ? 'Paid' : 'Pending'}` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}