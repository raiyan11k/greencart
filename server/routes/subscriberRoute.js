import express from 'express';
import { subscribe, getSubscribers, deleteSubscriber, toggleSubscriberStatus } from '../controllers/subscriberController.js';
import authSeller from '../middlewares/authSeller.js';

const subscriberRouter = express.Router();

// Public route - anyone can subscribe
subscriberRouter.post('/subscribe', subscribe);

// Protected routes - only seller/admin can access
subscriberRouter.get('/list', authSeller, getSubscribers);
subscriberRouter.post('/delete', authSeller, deleteSubscriber);
subscriberRouter.post('/toggle-status', authSeller, toggleSubscriberStatus);

export default subscriberRouter;
