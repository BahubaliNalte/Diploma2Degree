export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json();
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_SECRET;
    if (!key_id || !key_secret) {
      console.error("Razorpay credentials missing", { key_id, key_secret });
      return NextResponse.json({ success: false, error: "Razorpay credentials missing" }, { status: 500 });
    }
    // Dynamically import razorpay to avoid issues in edge runtimes
    const Razorpay = (await import("razorpay")).default;
    const instance = new Razorpay({ key_id, key_secret });
    const options = {
      amount: amount, // amount in paise
      currency: currency || "INR",
      receipt: `rcpt_${Date.now()}`,
    };
    const order = await instance.orders.create(options);
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ success: false, error: "Order creation failed" }, { status: 500 });
  }
}
