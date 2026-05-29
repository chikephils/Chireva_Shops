import React, { useEffect, useState } from "react";
import { Country, State } from "country-state-city";
import { server } from "../../server";
import { toast } from "react-toastify";
import { selectUser } from "../../features/user/userSlice";
import { itemsInCart } from "../../features/cart/cartSlice";
import { useSelector } from "react-redux";
import api from "../../utils/userApi";
import PaymentPage from "../../pages/User/PaymentPage";
import { numbersWithCommas } from "../../utils/priceDisplay";
import { PRICING } from "../../utils/pricing";

const Checkout = () => {
  const { SHIPPING_PER_SHOP, BASE_FEE, PER_VENDOR_FEE, PERCENTAGE_FEE, FLUTTERWAVE_PERCENT } = PRICING;

  const user = useSelector(selectUser);
  const cart = useSelector(itemsInCart);
  const [country, setCountry] = useState("");
  const [countryName, setCountryName] = useState("");
  const [state, setState] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [address1, setAddress1] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subTotalPrice, setSubTotalPrice] = useState(0);

  const token = useSelector((state) => state?.user?.token);

  // paymentSubmit function
  const paymentSubmit = async () => {
    if (cart.length < 1) return toast.error("Please add some Items to Cart");
    if (!address1 || !zipCode || !country || !state) {
      return toast.error("Please Provide a delivery address !");
    }
    setIsSubmitting(true);

    try {
      const shippingAddress = {
        address1,
        zipCode,
        country: countryName,
        state: stateName,
        city,
      };

      // map cart items to include appliedPrice and event flag
      const cartWithAppliedPrice = cart.map((item) => {
        const isEventActive =
          item?.isEvent &&
          item?.eventStartDate &&
          item?.eventEndDate &&
          new Date() >= new Date(item.eventStartDate) &&
          new Date() <= new Date(item.eventEndDate);

        return {
          ...item,
          appliedPrice: isEventActive ? item.discountPrice : item.originalPrice,
          wasEventActive: isEventActive,
        };
      });

      const tempOrderData = {
        cart: cartWithAppliedPrice,
        shippingAddress,
        user,
      };

      const response = await api.post(
        `${server}/order/create-order`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        tempOrderData,
      );

      if (!response?.data.success) {
        throw new Error("Failed to Create Order");
      }

      const createdOrder = response.data.orders;
      const paymentId = response.data.paymentId;
      const parentOrderId = response.data.parentOrderId;
      const totalAmount = response.data.totalAmount;
      const serviceFee = response.data.serviceFee;
      const totalPrice = response.data.totalPrice;
      const shipping = response.data.shipping;

      setOrderData({
        orders: createdOrder,
        paymentId,
        parentOrderId,
        totalAmount,
        serviceFee,
        totalPrice,
        shippingAddress,
        shipping,
      });
      setShowPayment(true);
      toast.info("Order Ready - Proceed to Payment");
    } catch (error) {
      console.error("Order Failed", error);
      toast.error(error?.response?.data?.message || "Failed to Create Order");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const totalPrice = cart?.reduce((acc, item) => {
      const isEventActive =
        item?.isEvent &&
        item?.eventStartDate &&
        item?.eventEndDate &&
        new Date() >= new Date(item.eventStartDate) &&
        new Date() <= new Date(item.eventEndDate);

      const price = isEventActive ? item.discountPrice : item.originalPrice;

      return acc + price * item.quantity;
    }, 0);
    setSubTotalPrice(totalPrice);
  }, [cart]);

  const uniqueShop = [...new Set(cart.map((item) => item.shopId))];
  const numberOfShops = uniqueShop.length;

  const shippingTotal = SHIPPING_PER_SHOP * numberOfShops;
  const shipping = SHIPPING_PER_SHOP;

  const serviceFee = BASE_FEE + PER_VENDOR_FEE * numberOfShops + PERCENTAGE_FEE * subTotalPrice;

  const subtotalBeforeFlutterwave = subTotalPrice + shippingTotal + serviceFee;

  const totalPayable = subtotalBeforeFlutterwave / (1 - FLUTTERWAVE_PERCENT);

  const flutterwaveFee = totalPayable - subtotalBeforeFlutterwave;

  const displayedServiceFee = serviceFee + flutterwaveFee;

  const finalTotal = Math.ceil(totalPayable);

  const totalPrice = finalTotal;

  const countries = Country.getAllCountries();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Shipping Form – 2/3 width on desktop */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>

        <form className="space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={`${user?.firstName || ""} ${user?.lastName || ""}`}
                required
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                defaultValue={user?.email || ""}
                required
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>
          </div>

          {/* Phone & Zip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                defaultValue={user?.phoneNumber || ""}
                required
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip / Postal Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                placeholder="Enter zip code"
              />
            </div>
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => {
                  const code = e.target.value;
                  const selectedCountry = countries.find((c) => c.isoCode === code);
                  setCountry(code);
                  setCountryName(selectedCountry?.name);
                  setState("");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white"
                required
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => {
                  const code = e.target.value;
                  const selectedState = State.getStatesOfCountry(country).find((s) => s.isoCode === code);
                  setState(code);
                  setStateName(selectedState?.name);
                }}
                disabled={!country}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select State</option>
                {country &&
                  State.getStatesOfCountry(country).map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Village, Community, Town, City, L.G.A,"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>
          </div>

          {/* Address lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                required
                placeholder="House No, Street Name, Estate, Landmark"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>
          </div>
        </form>

        {/* Saved addresses */}
        <button
          type="button"
          onClick={() => setUserInfo(!userInfo)}
          className="mt-6 w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition border border-red-200"
        >
          {userInfo ? "Hide" : "Choose from"} saved addresses
        </button>

        {userInfo && user?.addresses?.length > 0 && (
          <div className="mt-4 space-y-3">
            {user.addresses.map((addr, idx) => (
              <label key={idx} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <input
                  type="radio"
                  name="savedAddress"
                  className="mt-1 mr-3"
                  onChange={() => {
                    setAddress1(addr.address1 || "");
                    setZipCode(addr.zipCode || "");
                    setCity(addr.city || "");
                    setState(addr.state || "");
                    setCountry(addr.country || "");
                    setStateName(addr.state || "");
                    setCountryName(addr.country || "");
                    setUserInfo(false);
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">{addr?.addressType || "Address"}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {addr?.address1}
                    <br />
                    {addr?.city},{addr?.state}, {addr?.country} {addr?.zipCode}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-1 sticky">
        <CartData
          totalPrice={totalPrice}
          shipping={shipping}
          subTotalPrice={subTotalPrice}
          serviceFee={displayedServiceFee}
          shippingTotal={shippingTotal}
        />

        <button
          onClick={paymentSubmit}
          disabled={cart.length === 0 || isSubmitting}
          className={`
            mt-6 w-full py-4 px-6 text-white font-semibold rounded-lg shadow-lg transition-all
            ${cart.length === 0 || isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 active:bg-red-800"}
          `}
        >
          Proceed to Payment
        </button>
      </div>

      {/* Payment modal */}
      {showPayment && <PaymentPage orderData={orderData} setShowPayment={setShowPayment} createdOrders={orderData?.orders} />}
    </div>
  );
};

/* CartData component */
const CartData = ({ totalPrice, shipping, shippingTotal, subTotalPrice, serviceFee }) => {
  const formatPrice = (num) => numbersWithCommas(Math.ceil(num));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 top-24">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">₦{formatPrice(subTotalPrice)}</span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Shipping Fee</span>
          <span className="font-medium">₦{formatPrice(shippingTotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Service Fee</span>
          <span className="font-medium">₦{formatPrice(serviceFee)}</span>
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>₦{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
