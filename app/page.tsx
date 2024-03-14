import React from "react";
import Image from "next/image";
import Searchbox from "@/components/Searchbox";
import HeroCarousel from "@/components/HeroCarousel";
import { getAllProducts } from "@/lib/actions";
import ProductCard from "@/components/ProductCard";

const Home = async () => {
  const allProducts = await getAllProducts();

  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smart Shopping Here:
              <Image
                src={"/assets/icons/arrow-right.svg"}
                alt={"arrow-right"}
                width={16}
                height={16}
              />
            </p>
            <h1 className="head-text">
              No more <span className="text-primary">Overpaying</span>
            </h1>
            <p className="mt-6">
              Powerful product that help you buy items at cheap prices
            </p>
            <Searchbox />
          </div>
          <HeroCarousel />
        </div>
      </section>

      <section className="trending-section">
        <h2 className="section-text">Trending</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
