import Subscriber from "../models/Subscriber.js";

// Subscribe to newsletter: /api/subscriber/subscribe
export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        
        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.json({ success: false, message: "Email already subscribed" });
            } else {
                // Reactivate subscription
                existingSubscriber.isActive = true;
                await existingSubscriber.save();
                return res.json({ success: true, message: "Welcome back! Subscription reactivated" });
            }
        }

        // Create new subscriber
        await Subscriber.create({ email });
        res.json({ success: true, message: "Successfully subscribed to newsletter!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all subscribers (for seller): /api/subscriber/list
export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });
        res.json({ success: true, subscribers });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete subscriber (for seller): /api/subscriber/delete
export const deleteSubscriber = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.json({ success: false, message: "Subscriber ID is required" });
        }

        await Subscriber.findByIdAndDelete(id);
        res.json({ success: true, message: "Subscriber removed successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Toggle subscriber status (for seller): /api/subscriber/toggle-status
export const toggleSubscriberStatus = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.json({ success: false, message: "Subscriber ID is required" });
        }

        const subscriber = await Subscriber.findById(id);
        if (!subscriber) {
            return res.json({ success: false, message: "Subscriber not found" });
        }

        subscriber.isActive = !subscriber.isActive;
        await subscriber.save();
        
        res.json({ 
            success: true, 
            message: `Subscriber ${subscriber.isActive ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
