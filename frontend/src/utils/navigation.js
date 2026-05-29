let navigate = null;

export const setNavigate = (nav) => {
  if (nav) {
    navigate = nav;
  }
};

export const getNavigate = () => {
  return navigate;
};
