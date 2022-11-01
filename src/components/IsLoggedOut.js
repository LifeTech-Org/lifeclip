import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, provider } from "../firebaseConfig";
import Footer from "./Footer";
import logo from "../assets/imgs/logo.jpg";

const IsLoggedOut = () => {
  const handleClickSignInWithGmail = () => {
    signInWithPopup(auth, provider)
      .then((result) => {})
      .catch((error) => console.log(error));
  };
  return (
    <div className="isloggedout flex flex-col px-5">
      <article className="flex flex-col items-center">
        <div className="avatar h-24 w-24 rounded-full flex items-center justify-center">
          <img src={logo} alt="logo" className="w-20 h-20" />
        </div>
        <p className="p font-bold text-md mt-6">
          You are currently not signed in.
        </p>
        <div className="mt-4">
          <button
            onClick={handleClickSignInWithGmail}
            className="btn-default text-xs px-3 py-1 mr-2 rounded-full"
          >
            <FontAwesomeIcon icon={faGoogle} />
            <span className="ml-2 font-bold">
              Sign in with your google account
            </span>
          </button>
        </div>
      </article>
      <Footer className="mt-20" />
    </div>
  );
};

export default IsLoggedOut;
