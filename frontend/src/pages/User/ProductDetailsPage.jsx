import React, { useEffect, useState } from "react";
import Footer from "../../components/UI/Footer";
import ProductDetails from "../../components/ProductDetails/ProductDetails";
import { useParams, useSearchParams } from "react-router-dom";
import SuggestedProducts from "../../components/ProductDetails/SuggestedProducts";
import Loader from "../../components/UI/Loader";
import api from "../../utils/axios";
import { server } from "../../server";
import PageTransition from "../../components/UI/PageTransition";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [searchParams] = useSearchParams();
  const eventData = searchParams.get("isEvent") === "true";
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`${server}/product/get-product/${id}`);
      setData(response?.data.product);
    } catch (error) {
      console.error(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`${server}/event/get-event/${id}`);
      setData(response?.data.event);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventData === true) {
      fetchEvent();
    } else {
      fetchProduct();
    }
  }, [id]);

  return (
    <PageTransition>
      <div className="pt-[120px] md:pt-[100px]">
        {loading ? (
          <div className="flex items-center justify-center h-[85vh]">
            <Loader />
          </div>
        ) : (
          <>
            <ProductDetails product={data} />
            {!eventData && <>{data && <SuggestedProducts product={data} />}</>}
          </>
        )}
      </div>
      <Footer />
    </PageTransition>
  );
};

export default ProductDetailsPage;
