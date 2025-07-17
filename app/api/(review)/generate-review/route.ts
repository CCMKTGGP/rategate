import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import crypto from "crypto";
import connect from "@/lib/db";
import Business from "@/lib/models/business";
import Location from "@/lib/models/location";
import PreWrittenReview from "@/lib/models/prewritten-review";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// helper
function hashStrategy(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function POST(req: NextRequest) {
  await connect();
  const { businessId, locationId } = await req.json();

  const business = await Business.findById(businessId);
  if (!business) {
    return new NextResponse(
      JSON.stringify({ message: "Business not found." }),
      { status: 404 }
    );
  }

  let location = null;
  let strategy = business.business_strategy || "";

  if (locationId) {
    location = await Location.findById(locationId);
    if (!location || location.business_id.toString() !== businessId) {
      return new NextResponse(
        JSON.stringify({ message: "Location not found or unauthorized." }),
        { status: 404 }
      );
    }

    // ⛔ Require location strategy strictly
    if (!location.location_strategy) {
      return new NextResponse(
        JSON.stringify({
          message:
            "This location has no strategy set. Cannot generate reviews.",
        }),
        { status: 400 }
      );
    }

    strategy = location.location_strategy;
  } else {
    // ⛔ Require business strategy only if no location provided
    if (!business.business_strategy) {
      return new NextResponse(
        JSON.stringify({
          message:
            "This business has no strategy set. Cannot generate reviews.",
        }),
        { status: 400 }
      );
    }

    strategy = business.business_strategy;
  }

  if (!strategy) {
    return new NextResponse(
      JSON.stringify({ message: "No strategy provided." }),
      { status: 400 }
    );
  }

  const strategyHash = hashStrategy(strategy);

  const query = {
    strategy_hash: strategyHash,
    business_id: businessId,
    location_id: locationId || null,
  };

  let existingReviews = await PreWrittenReview.find(query);

  // 3. If no reviews found, generate 15 via OpenAI
  if (existingReviews.length === 0) {
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
        JSON.stringify({ message: "Failed to parse AI response." }),
        { status: 500 }
      );
    }

    const docs = generated.slice(0, 15).map((text: string) => ({
      business_id: businessId,
      location_id: locationId ?? null,
      strategy_hash: strategyHash,
      text,
      copied: false,
    }));

    await PreWrittenReview.insertMany(docs);
    existingReviews = await PreWrittenReview.find({
      business_id: businessId,
      location_id: locationId ?? null,
      strategy_hash: strategyHash,
    });
  }

  const uncopied = existingReviews.filter((r: any) => !r.copied);
  const selected = uncopied.sort(() => 0.5 - Math.random()).slice(0, 5);

  return new NextResponse(
    JSON.stringify({
      message: "Reviews fetched successfully!",
      data: {
        reviews: selected,
        strategy,
        source: existingReviews.length ? "cached" : "fresh",
      },
    }),
    { status: 200 }
  );
}
