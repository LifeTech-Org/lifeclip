import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faCaretDown, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Close } from "@mui/icons-material";
import { signInWithPopup, signOut } from "firebase/auth";
import React, { useState } from "react";
import { auth, provider } from "../firebaseConfig";
import ManageClips from "./ManageClips";
import Footer from "./Footer";

const IsLoggedIn = ({ user }) => {
  const [sort, setSort] = useState({ sortType: "ldm", asc: false });
  const [filter, setFilter] = useState(null);
  const [tags, setTags] = useState([]);
  const { uid, photoURL } = user;

  return (
    <div className="flex-1 flex flex-col max-w-5xl h-screen overflow-y py-10 px-5">
      <SearchTags {...{ tags, setTags, photoURL }} />
      <SortAndFilter {...{ filter, setSort, setFilter }} />
      <ManageClips {...{ sort, filter, tags, uid }} />
    </div>
  );
};

export default IsLoggedIn;

const SearchTags = ({ tags, setTags, photoURL }) => {
  const [newTag, setNewTag] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const handleClickAddNewTag = (e) => {
    e.preventDefault();
    //Only append if the tag doesnt exist already.
    if (!tags.find((tag) => tag === newTag)) {
      setTags([newTag, ...tags]);
    }
    setNewTag("");
  };

  const handleClickRemoveTag = (tag) => {
    setTags((prevTags) => prevTags.filter((_tag) => _tag !== tag));
  };
  return (
    <div className="searchtags">
      <form
        onSubmit={(e) => handleClickAddNewTag(e)}
        className="flex items-center border rounded-full"
      >
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="flex-1 w-full  bg-transparent text-xs text-white p-4 outline-none"
          placeholder="Enter search tags"
        />
        <div className="relative">
          <img
            src={photoURL}
            className="rounded-full h-11 w-11 ml-2 cursor-pointer"
            alt="avatar"
            onClick={() => setShowInfo(!showInfo)}
          />
          {showInfo && <Info />}
        </div>
      </form>
      {tags.length > 0 && (
        <ul className="tags flex my-1 flex-wrap">
          {tags.map((tag, index) => {
            return (
              <li key={index}>
                <div className="btn-default rounded-full  px-2 py-1  mt-2 mr-2 text-xs flex items-center justify-center">
                  <span>{tag}</span>
                  <button
                    onClick={() => handleClickRemoveTag(tag)}
                    className="w-fit h-fit flex items-center justify-center text-xs text-white"
                  >
                    <Close className="close text-red-500 ml-2 text-xs" />
                  </button>
                </div>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setTags([])}
              className="px-2 py-1 mt-2 mr-2 bg-red-200 text-red-900 rounded-full text-xs flex items-center justify-center"
            >
              Close all
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

const SortAndFilter = ({ filter, setSort, setFilter }) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const sortType = [
    { name: "date added", type: "doc" },
    { name: "date modified", type: "ldm" },
  ];
  const filterType = [
    {
      name: "clip type",
      type: "clipType",
      values: ["link", "mail", "tel", "text"],
    },
  ];
  return (
    <div className="flex my-1">
      <div className="dropdown relative">
        <div
          className="flex items-center heading px-4 py-1 mt-2 mr-2 rounded-full text-xs justify-center cursor-pointer"
          onClick={() => setShowSortMenu(!showSortMenu)}
        >
          <span>Sort</span>
          <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
        </div>
        {showSortMenu && (
          <ul className="menu absolute z-10 w-fit p-2 rounded-md text-xs mt-2 shadow-xl border">
            {sortType.map((sort) => {
              return (
                <React.Fragment key={sort.type}>
                  <li className="title uppercase py-1 ">{sort.name}</li>
                  <ul className="ml-2 mb-2">
                    <li
                      onClick={() => {
                        setSort({ sortType: sort.type, asc: false });
                        setShowSortMenu(false);
                      }}
                    >
                      <button className="subtitle capitalize py-1 outline-none">
                        new to old
                      </button>
                    </li>
                    <li
                      onClick={() => {
                        setSort({ sortType: sort.type, asc: true });
                        setShowSortMenu(false);
                      }}
                    >
                      <button className="subtitle capitalize py-1 outline-none">
                        old to new
                      </button>
                    </li>
                  </ul>
                </React.Fragment>
              );
            })}
          </ul>
        )}
      </div>
      <div className="dropdown">
        <span
          className="flex items-center heading px-4 py-1 mt-2 mr-2 rounded-full text-xs justify-center cursor-pointer"
          onClick={() => setShowFilterMenu(!showFilterMenu)}
        >
          <span>{filter ? filter.filterValue : "All"}</span>
          <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
        </span>
        {showFilterMenu && (
          <ul className="menu absolute z-10 w-fit p-2 rounded-md text-xs mt-2 shadow-xl border">
            <li
              onClick={() => {
                setFilter(null);
                setShowFilterMenu(false);
              }}
              className="title"
            >
              <button>All</button>
            </li>
            {filterType.map((filter) => {
              return (
                <React.Fragment key={filter.type}>
                  <li className="title uppercase py-1">{filter.name}</li>
                  <ul className="ml-2 mb-2">
                    {filter.values.map((value) => (
                      <li
                        key={value}
                        onClick={() => {
                          setFilter({
                            filterType: filter.type,
                            filterValue: value,
                          });
                          setShowFilterMenu(false);
                        }}
                      >
                        <button className="subtitle capitalize py-1">
                          {value}
                        </button>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

const Info = () => {
  const handleClickLogOut = () => {
    signOut(auth)
      .then(() => {})
      .catch(() => {});
  };

  const handleClickSignInWithADifferentAccount = () => {
    signOut(auth)
      .then(() => {
        signInWithPopup(auth, provider)
          .then((result) => {})
          .catch((error) => console.log(error));
      })
      .catch(() => {});
  };

  return (
    <div className="info mt-2 absolute right-0 w-72 sm:w-96 p-3 rounded-md shadow-xl z-20 border">
      <Footer />
      <div className="mt-2">
        <button
          onClick={handleClickLogOut}
          className="btn-default text-xs px-3 py-1 mr-2 rounded-full my-1"
        >
          <FontAwesomeIcon icon={faSignOut} />
          <span className="ml-2 font-bold">Sign out</span>
        </button>
        <button
          onClick={handleClickSignInWithADifferentAccount}
          className="btn-default text-xs px-3 py-1 mr-2 rounded-full my-1"
        >
          <FontAwesomeIcon icon={faGoogle} />
          <span className="ml-2 font-bold">
            Sign in with a different account
          </span>
        </button>
      </div>
    </div>
  );
};
