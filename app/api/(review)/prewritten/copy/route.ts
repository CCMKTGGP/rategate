import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import crypto from "crypto";
import connect from "@/lib/db";

import PrewrittenReview from "@/lib/models/prewritten-review";
import Business from "@/lib/models/business";
import Location from "@/lib/models/location";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function hashStrategy(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function POST(req: NextRequest) {
  await connect();
  const { reviewId } = await req.json();

  const review = await PrewrittenReview.findById(reviewId);
  if (!review) {
    return new NextResponse(JSON.stringify({ message: "Review not found." }), {
      status: 404,
    });
  }

  // Mark as copied (if not already)
  if (!review.copied) {
    await PrewrittenReview.updateOne(
      { _id: reviewId },
      { $set: { copied: true } }
    );
  }

  const { business_id, location_id, strategy_hash } = review;

  // Count how many are copied for this strategy
  const copiedCount = await PrewrittenReview.countDocuments({
    business_id,
    location_id,
    strategy_hash,
    copied: true,
  });

  // If copied >= 14 → regenerate all 15
  if (copiedCount >= 14) {
    // Get latest strategy
    const business = await Business.findById(business_id);
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business not found." }),
        { status: 404 }
      );
    }

    let strategy = business.strategy_text || "";
    if (location_id) {
      const location = await Location.findById(location_id);
      if (
        !location ||
        location.business_id.toString() !== business._id.toString()
      ) {
        return new NextResponse(
          JSON.stringify({ message: "Location not found or unauthorized." }),
          { status: 404 }
        );
      }
      strategy = location.strategy_text || business.strategy_text || "";
    }

    const newHash = hashStrategy(strategy);

    // Regenerate reviews with OpenAI
    const prompt = `
You are a helpful assistant that writes customer reviews.

Given this business strategy:
"${strategy}"

Generate 15 distinct, natural-sounding customer reviews with a positive tone, each under 200 characters. Return them as a JSON array:
[
  "Review 1...",
  ...
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
    });

    const content = completion.choices[0].message.content || "[]";

    let generated;
    try {
      generated = JSON.parse(content);
    } catch {
      return new NextResponse(
        JSON.stringify({ message: "Failed to parse regenerated AI reviews." }),
        { status: 500 }
      );
    }

    // Remove all old ones
    await PrewrittenReview.deleteMany({
      business_id,
      location_id,
      strategy_hash,
    });

    // Insert fresh 15
    const docs = generated.slice(0, 15).map((text: string) => ({
      business_id,
      location_id,
      strategy_hash: newHash,
      text,
      copied: false,
      createdAt: new Date(),
    }));

    await PrewrittenReview.insertMany(docs);

    // Return 5 random un-copied
    const fresh = docs.sort(() => 0.5 - Math.random()).slice(0, 5);

    return new NextResponse(
      JSON.stringify({
        message: "New reviews regenerated!",
        data: { reviews: fresh, regenerated: true },
      }),
      { status: 200 }
    );
  }

  // Otherwise return 5 un-copied reviews from same context
  const others = await PrewrittenReview.find({
    business_id,
    location_id,
    strategy_hash,
    copied: false,
  });

  const random5 = others.sort(() => 0.5 - Math.random()).slice(0, 5);

  return new NextResponse(
    JSON.stringify({
      message: "Review copied successfully.",
      data: { reviews: random5, regenerated: false },
    }),
    { status: 200 }
  );
}
