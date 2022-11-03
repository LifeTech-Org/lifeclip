import { Close } from "@mui/icons-material";
import copy from "copy-to-clipboard";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { generateKey } from "../assets/utils/generateKey";
import loading from "../assets/imgs/loading.gif";

const ClipContext = createContext(null);
const clipTypes = ["text", "link", "email", "tel"];

const ManageClips = ({ sort, filter, tags, uid }) => {
  const { sortType, asc } = sort;
  const { filterType, filterValue } =
    filter === null ? { filterType: null, filterValue: null } : filter;
  const [clips, setClips] = useState(null);
  const [stableClips, setStableClips] = useState(null);
  const snapshotIndex = useRef(0);

  useEffect(() => {
    const unSub = onSnapshot(
      collection(db, "users", uid, "clips"),
      (snapshot) => {
        snapshotIndex.current = snapshotIndex.current + 1;
        const clips = [];
        snapshot.forEach((doc) => {
          clips.push(doc.data());
        });
        setStableClips(clips);
        if (snapshotIndex.current === 1) {
          setClips(clips);
        }
      },
      (error) => {
        console.log("Error" + error);
      }
    );
    return () => unSub();
  }, [uid]);

  const isInArray = (_arr1, _arr2) => {
    let res = false;
    const [searchTags, clipTags] = [Array.from(_arr1), Array.from(_arr2)];
    for (let i = 0; i < searchTags.length; i++) {
      if (
        clipTags.find(
          (clipTag) =>
            clipTag.content
              .toString()
              .toLowerCase()
              .indexOf(searchTags[i].toString().toLowerCase()) !== -1
        )
      ) {
        res = true;
        break;
      }
    }
    return res;
  };

  return clips === null ? (
    <div className="flex-1 flex items-center justify-center">
      <article className="flex flex-col items-center">
        <img src={loading} alt="loading" className="mb-10 h-10" />
        <h3 className="text-center text-white text-sm">Loading clips</h3>
      </article>
    </div>
  ) : (
    <ClipContext.Provider value={{ clips, setClips, stableClips, uid }}>
      <section className="flex-1 overflow-auto">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-3 my-2">
          <li>
            <NewClip {...{ setClips, uid }} />
          </li>
          {clips
            .filter((clip) =>
              filterType === null ? true : clip[filterType] === filterValue
            )
            .filter((clip) =>
              tags.length === 0 ? true : isInArray(tags, clip.tags)
            )
            .sort((a, b) =>
              asc ? a[sortType] - b[sortType] : b[sortType] - a[sortType]
            )
            .map((clip) => (
              <li key={clip.id}>
                <Clip {...clip} />
              </li>
            ))}
        </ul>
      </section>
    </ClipContext.Provider>
  );
};

export default ManageClips;

const NewClip = ({ setClips, uid }) => {
  const [newClip, setNewClip] = useState({
    id: generateKey(),
    content: "",
    tags: [],
    clipType: "text",
  });
  const [actionsStatus, setActionsStatus] = useState({
    discard: "rest",
    add: "rest",
  });
  const [newTag, setNewTag] = useState("");
  const handleChangeNewClipContent = (e) => {
    setNewClip({ ...newClip, content: e.target.value });
  };
  const handleChangeNewClipType = (e) => {
    setNewClip({ ...newClip, clipType: e.target.value });
  };
  const handleClickAddNewClipTag = (e) => {
    e.preventDefault();
    if (!Array.from(newClip.tags).find((tag) => tag.content === newTag)) {
      setNewClip({
        ...newClip,
        tags: [...newClip.tags, { id: generateKey(), content: newTag }],
      });
    }
    setNewTag("");
  };

  const handleClickDeleteNewClipTag = (newClipTagId) => {
    setNewClip({
      ...newClip,
      tags: Array.from(newClip.tags).filter(
        (newClipTag) => newClipTag.id !== newClipTagId
      ),
    });
  };
  const handleClickPaste = () => {
    navigator.clipboard
      .readText()
      .then((text) => setNewClip({ ...newClip, content: text }));
  };
  const handleClickAddNewClip = async () => {
    setActionsStatus({ ...actionsStatus, add: "adding" });
    const _newClip = { ...newClip, doc: Timestamp.now(), ldm: Timestamp.now() };
    await setDoc(doc(db, "users", uid, "clips", newClip.id), _newClip)
      .then(() => {
        setClips((prevClips) => {
          return [_newClip, ...prevClips];
        });
        setNewClip({
          id: generateKey(),
          content: "",
          tags: [],
          clipType: "text",
        });
        setNewTag("");
        setActionsStatus({ ...actionsStatus, add: "rest" });
      })
      .catch(() => {
        setActionsStatus({ ...actionsStatus, add: "failed" });
      });
  };
  const handleClickDiscardNewClip = () => {
    if (actionsStatus.discard === "rest") {
      setActionsStatus({ ...actionsStatus, discard: "pending" });
      setTimeout(
        () => setActionsStatus({ ...actionsStatus, discard: "rest" }),
        3000
      );
    } else {
      setNewClip({
        id: new Date().getMilliseconds(),
        content: "",
        tags: [],
        doc: "",
        ldm: "",
        clipType: "text",
      });
      setNewTag("");
      setActionsStatus({ ...actionsStatus, discard: "rest" });
    }
  };
  const disableAddNewClipActionButton = newClip.content.length < 1;
  const disableDiscardActionbutton =
    newClip.content.length + newClip.tags.length < 1 ||
    newClip.clipType !== "text";

  return (
    <article className="clip  flex flex-col w-sm  border p-2 rounded-md">
      <textarea
        value={newClip.content}
        onChange={(e) => handleChangeNewClipContent(e)}
        className="text-xs p-2"
      />
      <ul className="tags flex flex-wrap">
        <li>
          <select
            onChange={(e) => handleChangeNewClipType(e)}
            className="btn-default rounded-sm  px-2 py-1  mt-2 mr-2 text-xs flex items-center justify-center"
            value={newClip.clipType}
          >
            {clipTypes.map((clipType, index) => (
              <option key={index} value={clipType}>
                {clipType}
              </option>
            ))}
          </select>
        </li>
        {newClip.tags.map((tag) => (
          <li key={tag.id}>
            <div className="btn-default rounded-sm  px-2 py-1  mt-2 mr-2 text-xs flex items-center justify-center">
              <span>{tag.content}</span>
              <button className="w-fit h-fit flex items-center justify-center text-xs">
                <Close
                  className="close text-red-500 ml-2 text-xs"
                  onClick={() => handleClickDeleteNewClipTag(tag.id)}
                />
              </button>
            </div>
          </li>
        ))}
        <li>
          <form
            className="mt-2 mr-2 rounded-md flex items-center justify-center"
            onSubmit={(e) => handleClickAddNewClipTag(e)}
          >
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-20 px-2 py-1 rounded-sm border text-xs"
              placeholder="New tag"
            />
          </form>
        </li>
      </ul>
      <div className="flex justify-end">
        <button
          onClick={handleClickPaste}
          className="btn-default border px-3 py-1 mt-2 mr-2 rounded-md text-xs flex items-center justify-center"
        >
          Paste clipboard
        </button>
        <button
          disabled={disableDiscardActionbutton}
          onClick={handleClickDiscardNewClip}
          className="btn-default border px-3 py-1 mt-2 mr-2 rounded-md text-xs flex items-center justify-center"
        >
          {actionsStatus.discard === "rest" ? "discard" : "discard?"}
        </button>
        <button
          disabled={
            disableAddNewClipActionButton || actionsStatus.add !== "rest"
          }
          onClick={handleClickAddNewClip}
          className="btn-default border px-3 py-1 mt-2 mr-2 rounded-md text-xs flex items-center justify-center"
        >
          {actionsStatus.add === "rest" ? "add" : actionsStatus.add}
        </button>
      </div>
    </article>
  );
};

const Clip = ({ id, content, tags, clipType }) => {
  return (
    <article className="clip flex flex-col w-sm border p-2 rounded-md">
      <ClipContent id={id} content={content} clipType={clipType} />
      <ClipTags id={id} tags={tags} clipType={clipType} />
      <ClipActions id={id} content={content} />
    </article>
  );
};

const ClipContent = ({ id, content, clipType }) => {
  const { setClips } = useContext(ClipContext);
  const [clipContentEditMode, setClipContentEditMode] = useState(false);
  const handleChangeClipContent = (e) => {
    setClips((prevClips) =>
      Array.from(prevClips).map((clip) =>
        clip.id === id ? { ...clip, content: e.target.value } : clip
      )
    );
  };
  return clipContentEditMode ? (
    <textarea
      value={content}
      onBlur={() => setClipContentEditMode(false)}
      onChange={(e) => handleChangeClipContent(e)}
      className="text-xs p-2"
    />
  ) : clipType === "code" ? (
    <pre>
      <code
        onDoubleClick={() => setClipContentEditMode(true)}
        className="language-javascript content overflow-auto p-2 text-xs"
        title="Double-click to edit"
      >
        {content}
      </code>
    </pre>
  ) : (
    <div
      onDoubleClick={() => setClipContentEditMode(true)}
      className="content overflow-auto p-2 text-xs"
      title="Double-click to edit"
    >
      {content}
    </div>
  );
};

const ClipTags = ({ id, tags, clipType }) => {
  const { setClips } = useContext(ClipContext);
  const [newTag, setNewTag] = useState("");
  const handleChangeClipType = (e) => {
    setClips((prevClips) =>
      Array.from(prevClips).map((clip) =>
        clip.id === id ? { ...clip, clipType: e.target.value } : clip
      )
    );
  };
  const handleClickAddNewClipTag = (e) => {
    e.preventDefault();
    if (!Array.from(tags).find((tag) => tag.id === newTag)) {
      setClips((prevClips) =>
        Array.from(prevClips).map((clip) =>
          clip.id === id
            ? {
                ...clip,
                tags: [
                  ...clip.tags,
                  {
                    id: generateKey(),
                    content: newTag,
                  },
                ],
              }
            : clip
        )
      );
    }

    setNewTag("");
  };
  const handleClickDeleteClipTag = (clipTagId) => {
    setClips((prevClips) =>
      Array.from(prevClips).map((clip) =>
        clip.id === id
          ? {
              ...clip,
              tags: Array.from(clip.tags).filter(
                (clipTag) => clipTag.id !== clipTagId
              ),
            }
          : clip
      )
    );
  };
  return (
    <ul className="tags flex flex-wrap overflow-y-auto">
      <li>
        <select
          onChange={(e) => handleChangeClipType(e)}
          className="btn-default rounded-sm  px-2 py-1  mt-2 mr-2 text-xs flex items-center justify-center"
          value={clipType}
        >
          {clipTypes.map((clipType, index) => (
            <option key={index} value={clipType}>
              {clipType}
            </option>
          ))}
        </select>
      </li>
      {Array.from(tags).map((tag) => {
        return (
          <li key={tag.id}>
            <div className="btn-default rounded-sm  px-2 py-1  mt-2 mr-2 text-xs flex items-center justify-center">
              <span>{tag.content}</span>

              <button
                onClick={() => handleClickDeleteClipTag(tag.id)}
                className="w-fit h-fit flex items-center justify-center text-xs"
              >
                <Close className="close text-red-500 ml-2 text-xs" />
              </button>
            </div>
          </li>
        );
      })}
      <li>
        <form
          className="mt-2 mr-2 rounded-md flex items-center justify-center"
          onSubmit={(e) => handleClickAddNewClipTag(e)}
        >
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="w-20 px-2 py-1 rounded-sm border text-xs"
            placeholder="New tag"
          />
          {/* <button onClick={(e) => handleClickAddNewTag(e)}>Add new tag</button> */}
        </form>
      </li>
    </ul>
  );
};

const ClipActions = ({ id, content }) => {
  const { clips, setClips, stableClips, uid } = useContext(ClipContext);
  const [actionsStatus, setActionsStatus] = useState({
    copy: "rest",
    delete: "rest",
    update: "rest",
  });
  const [clip1, clip2] = [
    Array.from(clips).find((clip) => clip.id === id),
    Array.from(stableClips).find((clip) => clip.id === id),
  ];
  const handleClickCopyClip = () => {
    copy(content);
    let status = true;
    status
      ? setActionsStatus({ ...actionsStatus, copy: "copied" })
      : setActionsStatus({ ...actionsStatus, copy: "failed" });
    setTimeout(
      () => setActionsStatus({ ...actionsStatus, copy: "rest" }),
      3000
    );
  };
  const handleClickDeleteClip = async (id) => {
    if (actionsStatus.delete === "rest") {
      setActionsStatus({ ...actionsStatus, delete: "pending" });
      setTimeout(
        () => setActionsStatus({ ...actionsStatus, delete: "rest" }),
        3000
      );
    } else {
      await deleteDoc(doc(db, "users", uid, "clips", id))
        .then(() => {
          setClips((prevClips) =>
            Array.from(prevClips).filter((clip) => clip.id !== id)
          );
        })
        .catch((error) => console.log("Error deleting file: " + error));
    }
  };
  const handleClickUpdateClip = async (id) => {
    const clip = Array.from(clips).find((clip) => clip.id === id);
    await updateDoc(doc(db, "users", uid, "clips", id), {
      content: clip.content,
      tags: clip.tags,
      clipType: clip.clipType,
      ldm: Timestamp.now(),
    })
      .then(() => {
        setClips(
          clips.map((clip) =>
            clip.id === id ? { ...clip, ldm: Timestamp.now() } : clip
          )
        );
      })
      .catch((error) => console.log("Error" + error));
  };
  const sameClipObject = (clip1, clip2) => {
    //Checking for undefined because clip2 mmight not be ready after adding a new clip
    return clip2 === undefined
      ? true
      : clip1.content === clip2.content &&
          JSON.stringify(clip1.tags) === JSON.stringify(clip2.tags) &&
          clip1.clipType === clip2.clipType;
  };
  const showClipTypeAction =
    clip2.clipType === "link" ||
    clip2.clipType === "email" ||
    clip2.clipType === "tel";
  const getClipHrefPrefix = (clipType) => {
    let res = "";
    if (clipType === "link") {
      res = "https://";
    } else if (clipType === "email") {
      res = "mailto:";
    } else {
      res = "tel:";
    }
    return res;
  };
  return (
    <div className="flex justify-end">
      {/* <button className="bg-transparent border-none">
        <Info className="text-sky-800" />
      </button> */}
      <div className="flex">
        {showClipTypeAction && (
          <a
            href={getClipHrefPrefix(clip2.clipType) + clip2.content}
            target="_blank"
            rel="noreferrer"
          >
            <button
              className="btn-default border px-3 py-1 mt-2 mr-2 rounded-md text-xs flex items-center justify-center"
            >
              {clip2.clipType === "link" && "visit"}
              {clip2.clipType === "email" && "email"}
              {clip2.clipType === "tel" && "call"}
            </button>
          </a>
        )}
        <button
          onClick={handleClickCopyClip}
          className="btn-default border px-3 py-1 mt-2 mr-2 rounded-md text-xs flex items-center justify-center"
        >
          {actionsStatus.copy === "rest" ? "copy" : actionsStatus.copy}
        </button>
        <button
          onClick={() => handleClickDeleteClip(id)}
          className="btn-default border px-3 py-1 mt-2 mr-2 bg-sky-100 text-sky-800 rounded-md text-xs flex items-center justify-center"
        >
          {actionsStatus.delete === "rest" ? "delete" : "delete?"}
        </button>
        {!sameClipObject(clip1, clip2) && (
          <button
            onClick={() => handleClickUpdateClip(id)}
            className="btn-default border px-3 py-1 mt-2 mr-2 bg-sky-100 text-sky-800 rounded-md text-xs flex items-center justify-center"
          >
            update
          </button>
        )}
      </div>
    </div>
  );
};
