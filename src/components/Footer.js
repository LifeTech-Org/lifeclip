import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faCoffee,
  faMailForward,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/imgs/logo.jpg";
import React from "react";

const Footer = ({ className }) => {
  const _className = className ? className : "";
  return (
    <footer className={_className + " flex flex-col text-sm "}>
      <article className="heading flex items-center">
        <img src={logo} alt="logo" className="h-5 w-5" />
        <h3 className="ml-2 font-bold">Lifeclip</h3>
      </article>
      <div className="flex mt-4">
        <ContactAvatar
          icon={faGithub}
          link="https://github.com/LifeTech-Org/lifeclip"
          text="View on github"
        />
        <ContactAvatar
          icon={faMailForward}
          link="mailto:ayetigbosamuel01@gmail.com"
          text="Email developer"
        />
      </div>
      <div className="info text-xs mt-2">
        <span>Made with blood and sweat by </span>
        <a
          href="https://lifetechportfolio.netlify.app"
          className=" mt-2 uppercase text-blue-300"
        >
          lifetech
        </a>
      </div>
      <div className="donate font-bold text-xs mt-2">
        <span className="mr-2">
          Please 👏, buy me a cup of coffee <FontAwesomeIcon icon={faCoffee} />{" "}
          to keep my blood running 💪.
        </span>
        <a
          href="https://www.paypal.com/donate/?hosted_button_id=GQP3B34WZ5YDJ"
          className="bg-blue-800 px-3 py-1 my-2 rounded-full text-xs  hover:bg-blue-700 flex w-fit items-center"
        >
          <FontAwesomeIcon icon={faMoneyBill} className="text-orange-300" />
          <span className="font-bold ml-1 text-orange-200">Donate</span>
        </a>
      </div>
    </footer>
  );
};

const ContactAvatar = ({ icon, link, text }) => {
  return (
    <a
      href={link}
      className="btn-default text-xs px-3 py-1 mr-2 rounded-full min-w-fit"
    >
      <FontAwesomeIcon icon={icon} />
      <span className=" ml-2 font-bold ">{text}</span>
    </a>
  );
};

export default Footer;
