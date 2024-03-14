import { PriceHistoryItem, Product } from "@/types";

const Notification = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
};

const THRESHOLD_PERCENTAGE = 40;

// Extracts and returns the price from a list of possible elements.
export function extractPrice(...elements: any) {
  for (const element of elements) {
    const priceText = element.text().trim();

    if (priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, "");
      let firstPrice;

      if (cleanPrice) {
        firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
      }

      return firstPrice || cleanPrice;
    }
  }

  return "";
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: any) {
  const currencyText = element.text().trim().slice(0, 1);

  return currencyText ? currencyText : "";
}

// Extracts and returns the discount percentage of the item.
export function extractDiscountRates(element: any) {
  const discountRate = element.text().split("%")[0].replace(/[-]/g, "");

  return discountRate ? discountRate : "";
}

// Extracts description from two possible elements from amazon
export function extractDescription($: any) {
  // these are possible elements holding description of the product
  const selectors = [
    ".a-unordered-list .a-spacing-mini .a-list-item",
    ".a-expander-content p",
    // Add more selectors here if needed
  ];

  for (const selector of selectors) {
    const elements = $(selector);

    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .join("\n");

      return textContent;
    }
  }

  // If no matching elements were found, return an empty string
  return "";
}

// Extracts and returns the category in which the item was found.
export function extractCategory(element: any) {
  const categoryList = element
    .text()
    .trim()
    .replace(/(\r\n|\n|\r)/gm, " ")
    .split("  ");

  let category = "";

  categoryList.forEach((element: string) => {
    element = element.trimStart();

    if (element !== "") {
      category += element;
      category += " => ";
    }
  });
  category = category.substring(0, category.length - 4);

  return category ? category : "";
}

// Extracts and returns the number of reviews on the item.
export function extractReviewsCount(element: any) {
  let reviewsCount = element
    .text()
    .trim()
    .split("ratings")[0]
    .replace(/[,]/g, "");
  reviewsCount = parseInt(reviewsCount);

  return reviewsCount ? reviewsCount : "";
}

// Extracts and returns the rating of the item.
export function extractStars(element: any) {
  const stars = element.text().trim().split(" ")[0];

  return stars ? stars : "";
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  priceList.forEach((element) => {
    if (element.price < lowestPrice.price) {
      lowestPrice = element;
    }
  });

  return lowestPrice.price;
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  priceList.forEach((element) => {
    if (element.price > lowestPrice.price) {
      lowestPrice = element;
    }
  });

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotificationType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }

  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }

  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};
