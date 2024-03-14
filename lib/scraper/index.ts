"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import * as utils from "../utils";

export async function scrapeProduct(url: string) {
  if (!url) {
    return;
  }

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    // Extract the product data
    const title = $("#productTitle").text().trim();

    const currentPrice = utils.extractPrice(
      $(".priceToPay"),
      $(".a-section a-price"),
      $("#twister-plus-price-data-price")
    );

    const originalPrice = utils.extractPrice(
      $(".aok-relative .a-price.a-text-price span.a-offscreen"),
      $(".a-section .aok-relative span.aok-offscreen")
    );

    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const images =
      $("#landingImage").attr("data-a-dynamic-image") ||
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      "{}";

    const imgUrls = Object.keys(JSON.parse(images));

    const currency = utils.extractCurrency($(".a-price-symbol"));

    const discountRate = utils.extractDiscountRates(
      $(".a-section span.savingsPercentage")
    );

    const category = utils.extractCategory(
      $(
        "#wayfinding-breadcrumbs_feature_div li span.a-list-item .a-link-normal"
      )
    );

    const reviewsCount = utils.extractReviewsCount(
      $("#acrCustomerReviewLink span#acrCustomerReviewText")
    );

    const stars = utils.extractStars(
      $("#acrPopover .a-popover-trigger span.a-size-base")
    );

    const description = utils.extractDescription($);

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || "$",
      image: imgUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: category || "Unknown",
      reviewsCount: Number(reviewsCount),
      stars: Number(stars),
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };

    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}
