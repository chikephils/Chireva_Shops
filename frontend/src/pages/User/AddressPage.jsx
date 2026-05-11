import React, { useState } from "react";
import Address from "../../components/Profile/Address";
import CreateAddress from "../../components/Profile/CreateAddress";

const AddressPage = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="w-full fixed lg:w-[70%] xl:w-[75%] left-0 right-0 mx-auto lg:left-auto lg:right-auto ml-0 lg:ml-[26%] xl:ml-[21%] bg-white rounded-xl shadow-lg p-2 pt-6 lg:pt-3 lg-p-4 h-[calc(100%-130px)]">
        <Address setOpen={setOpen} />
      </div>

      {open && <CreateAddress setOpen={setOpen} />}
    </>
  );
};

export default AddressPage;
