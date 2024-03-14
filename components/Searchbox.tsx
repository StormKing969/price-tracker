"use client";
import { scrapeAndStoreProduct } from "@/lib/actions";
import React, { FormEvent, use, useState } from "react";

const isValidProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (hostname.includes("amazon")) {
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return false;
};

const Searchbox = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidProductURL(searchPrompt);

    if (!isValidLink) {
      return alert("Please provide a valid link");
    }

    try {
      setIsLoading(true);

      // Scrape the product page
      const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbox-input"
      />
      <button
        type="submit"
        className="searchbox-btn"
        disabled={searchPrompt === ""}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default Searchbox;
