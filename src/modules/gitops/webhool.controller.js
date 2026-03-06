import { processWebhook } from "./webhook.service.js";
// import { ApiError } from "../../utils/error.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {asyncHandler} from "../../utils/asyncHandler.js";

const handleWebhook = asyncHandler(async (req, res) => {
    // 1️⃣ Request se headers lo
    const event = req.headers['x-github-event']; // GitHub webhook events ke liye standard header hota hai  // "push", "pull_request", etc.
    // 2️⃣ Validate karo ki event header present hai
    // 3️⃣ Sirf "push" events ko process karo, baaki ignore kar do
    // 4️⃣ Agar event "push" hai to processWebhook function ko call karo

    if(event !== "push") {
        console.log(`Received unsupported event: ${event}. Ignoring.`);
        return res.status(200).json(new ApiResponse(200, "Event ignored")); // Unsupported events ke liye bhi 200 OK bhejo, taaki GitHub ko pata chale ki webhook successfully received ho gaya hai, lekin hum usko process nahi kar rahe hain.
    }
    // 5️⃣ processWebhook function ko call karo aur payload pass karo

    await processWebhook(req.body);
// 6️⃣ Agar sab kuch sahi raha to success response bhejo
    return res.status(200).json(new ApiResponse(200, "Webhook processed successfully"));
})

export {
    handleWebhook
};