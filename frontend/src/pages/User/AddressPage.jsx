import React, { useState } from "react";
import Address from "../../components/Profile/Address";
import CreateAddress from "../../components/Profile/CreateAddress";

const AddressPage = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col h-full">
        <Address setOpen={setOpen} />
      </div>

      {open && <CreateAddress setOpen={setOpen} />}
    </>
  );
};

export default AddressPage;
