import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import admin from "../../../lib/firebaseAdmin";

export const runtime = "nodejs";

// Razorpay webhook secret (set this in your Razorpay dashboard and as an env variable)
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Razorpay sends the payload as raw body
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!WEBHOOK_SECRET || !signature) {
      return NextResponse.json({ success: false, error: "Missing webhook secret or signature" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      // You must map payment.order_id to your user (store order_id <-> user.uid when creating order)
      // Example: Find user by order_id, then:
      // We'll look up a mapping in the database: Orders/{order_id}/uid
      const orderId = payment.order_id;
      let userUid = null;
      try {
        const orderSnap = await admin.database().ref("Orders/" + orderId + "/uid").once("value");
        userUid = orderSnap.val();
      } catch (e) {
        console.error("Order lookup failed", e);
      }
      if (userUid) {
        // Save premium membership info
        const memberData = {
          paymentId: payment.id,
          orderId: payment.order_id,
          email: payment.email || "",
          phone: payment.contact || "",
          amount: payment.amount / 100, // convert paise to INR
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          capturedAt: payment.captured_at ? new Date(payment.captured_at * 1000).toISOString() : new Date().toISOString(),
          timestamp: Date.now(),
        };
        await admin.database().ref("PlusMembers/" + userUid).set(memberData);
        console.log("Plus membership activated for UID:", userUid);
      } else {
        console.error("No user UID found for order_id:", orderId);
      }
    }

    // You can handle other events as needed

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Webhook error" }, { status: 500 });
  }
}
