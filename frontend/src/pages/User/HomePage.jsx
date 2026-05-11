import React, { useEffect } from "react";
import Categories from "../../components/Route/Categories/Categories";
import BestDeals from "../../components/Route/BestDeals/BestDeals";
import FeaturedProduct from "../../components/Route/FeaturedProduct/FeaturedProduct";
import Events from "../../components/Events/Events";
import Sponsored from "../../components/Route/Sponsored";
import Footer from "../../components/UI/Footer";
import Slider from "../../components/UI/Slider";
import PageTransition from "../../components/UI/PageTransition";
import { useDispatch } from "react-redux";
import { getAllProducts, getPromoProducts } from "../../features/product/productSlice";

const HomePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProducts({ page: 1, limit: 8 }));
    dispatch(getPromoProducts({ page: 1, limit: 8 }));
  }, [dispatch]);

  return (
    <PageTransition>
      <div className=" pt-[120px] md:pt-[100px]">
        <Slider />
        <Categories />
        <Events />
        <BestDeals />
        <FeaturedProduct />
        <Sponsored />
      </div>
      <Footer />
    </PageTransition>
  );
};

export default HomePage;
