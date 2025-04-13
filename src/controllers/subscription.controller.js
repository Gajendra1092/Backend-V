import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscriptions.models.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const {channelId} = req.params
    const {userId} = req.user._id;

    if(!channelId && !userId){
        throw new ApiError(400,"Give channel and user info!")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        // If already subscribed, unsubscribe (delete the subscription)
        await existingSubscription.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed successfully!")
        );
    }

    const subscriptionDocument = await Subscription.create({
        subscriber:userId,
        channel:channelId
    })

    if(!subscriptionDocument){
        throw new ApiError(400, "Error in subscribing!");
    }

    res.status(200).json(new ApiResponse(200, subscriptionDocument, "Subscription successful!"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: new mongoose.Types.ObjectId(channelId),
                totalSubscribers: { $sum: 1 }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers[0] || { totalSubscribers: 0 },
            "Subscribers fetched successfully!"
        )
    );
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    // const { userId } = req.user._id;

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber Id is required!");
    }

    // if (!isValidObjectId(subscriberId)) {
    //     throw new ApiError(400, "Invalid Subscriber Id!");
    // }       

    const subscriptions = await Subscription.aggregate([{
        $match:{
            subscriber: new mongoose.Types.ObjectId(subscriberId)
        }
    },{
        $group:{
            _id: new mongoose.Types.ObjectId(subscriberId),
            totalSubscriptions: { $sum: 1 }
        }
    }

])

     res.status(200).json(
        new ApiResponse(
            200,
            subscriptions,
            "Subscribed channels fetched successfully!"
    ))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}