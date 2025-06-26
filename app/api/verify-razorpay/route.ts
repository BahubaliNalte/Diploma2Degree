import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
    const secret = process.env.RAZORPAY_SECRET;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !secret) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
