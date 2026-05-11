import { RotatingLines } from "react-loader-spinner";

const CreateLoader = () => {
  return (
    <div>
      <RotatingLines
        height="100"
        width="100"
        color="#4fa94d"
        ariaLabel="rotating-lines-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
};

export default CreateLoader;