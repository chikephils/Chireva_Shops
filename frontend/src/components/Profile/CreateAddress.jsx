import React, { useState } from "react";
import { updateUserAddress } from "../../features/user/userSlice";
import { RxCross1 } from "react-icons/rx";
import { useDispatch } from "react-redux";
import { Country, State } from "country-state-city";
import { toast } from "react-toastify";
import SmallLoader from "../UI/SmallLoader";

const CreateAddress = ({ setOpen }) => {
  const [country, setCountry] = useState("");
  const [countryName, setCountryName] = useState("");
  const [state, setState] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [addressType, setAddressType] = useState("");

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const addressTypeData = ["Default", "Office", "Home"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!country || !state || !address1 || !addressType) {
      toast.error("Please fill all required fields (Country, City, Address Type)");
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        updateUserAddress({
          country: countryName,
          state: stateName,
          city,
          address1,
          zipCode,
          addressType,
        }),
      ).unwrap();
      setOpen(false);

      // Reset form
      setCountry("");
      setState("");
      setCity("");
      setAddress1("");
      setZipCode("");
      setAddressType("");
    } catch (error) {
     console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const countries = Country.getAllCountries();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col pb-5">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
          <h5 className=" text-base md:text-lg 800px:text-xl font-semibold text-center">Add new address</h5>
          <RxCross1
            size={24}
            className="absolute top-4 right-4 z-10 cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition"
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="flex-1 overflow-y-scroll scrollbar-hide px-5 pb-10 pt-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => {
                  const code = e.target.value;
                  const selectedCountry = countries.find((c) => c.isoCode === code);
                  setCountry(code);
                  setCountryName(selectedCountry?.name);
                  setState("");
                }}
                className="peer w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900"
                required
              >
                <option value="" disabled hidden />
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => {
                  const code = e.target.value;
                  const selectedState = State.getStatesOfCountry(country).find((s) => s.isoCode === code);
                  setState(code);
                  setStateName(selectedState?.name);
                }}
                className="peer w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 "
                disabled={!country}
                required
              >
                <option value="" disabled hidden />
                {country &&
                  State.getStatesOfCountry(country).map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </option>
                  ))}
                {!country && <option value="">Select country first</option>}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="peer w-full py-3 px-3 border border-gray-300 rounded-lg text-gray-900"
                placeholder="L.G.A, Town, Community, Village"
              />
            </div>

            {/* Address 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                className="peer w-full py-3 px-3 border border-gray-300 rounded-lg text-gray-900"
                placeholder="(House-Number, Street Name, Estate Name) "
                required
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="peer w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder=" "
              />
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none text-sm font-medium
                  ${zipCode ? "top-2 text-gray-500 text-xs" : "top-4 text-gray-700"}`}
              >
                ZIP / Postal Code
              </label>
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address Type <span className="text-red-500">*</span>
              </label>
              <select
                value={addressType}
                onChange={(e) => setAddressType(e.target.value)}
                className="peer w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                required
              >
                <option value="" disabled hidden />
                {addressTypeData.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <SmallLoader /> Saving...
                  </>
                ) : (
                  "Add Address"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAddress;
