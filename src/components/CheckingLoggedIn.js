import React from "react";
import loading from "../assets/imgs/loading.gif";

const CheckingLoggedIn = () => {
  return (
    <article className="checkingloggedin flex flex-col items-center">
      <img src={loading} alt="loading" className="mb-10 h-10 w-10" />
      <h2 className="text-center">Checking Signed In Status</h2>
    </article>
  );
};

export default CheckingLoggedIn;
