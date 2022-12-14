import React, { useEffect, useRef, useState } from "react";
import "./RedactTodoModal.less";
import axios from "axios";
import {
  getDownloadURL,
  deleteObject,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../firebase/firebase";

/**
 * @callback getTodos - Function that get todos from backend.
 */
/**
 * @callback setShowModal - Function that show modal.
 */
/**
 * Represents a todo.
 *
 * @param {boolean} showModal - State of visibility of modal
 * @param {setShowModal} setShowModal - Function that show modal
 * @param {[string,object]} todo - The object of todo in list.
 * @param {getTodos} getTodos - Function that get todos from backend.
 * @param {string} todo.title - The title of todo
 * @param {string} todo.body - The body of todo
 * @param {string} todo.completeDate - Planned completion date of todo
 * @param {object[]} todo.attachedFiles - Files that attached to todo
 * @param {string} todo.attachedFiles.url - Download file`s url
 */
const RedactTodoModal = ({ showModal, setShowModal, todo, getTodos }) => {
  const modalFileRef = useRef();
  const [redactTodo, setRedactTodo] = useState({
    attachedFiles: [],
    ...todo[1],
  });

  useEffect(() => {
    setRedactTodo({ attachedFiles: [], ...todo[1] });
  }, [todo]);

  const deleteFileOnServer = async (file) => {
    const fileRef = ref(storage, `files/${file.name}`);
    await deleteObject(fileRef);
  };

  const updateTodo = async () => {
    const deleteFiles =
      todo[1].attachedFiles?.filter(
        (file) => !redactTodo.attachedFiles.find((f) => f.name === file.name)
      ) || [];

    await Promise.all(deleteFiles.map(deleteFileOnServer));

    const updateLoadFiles = await Promise.all(
      Array.from(redactTodo.newAttachedFiles || []).map(async (file) => {
        const imageRef = ref(storage, `files/${file.name}`);
        const uploadTask = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(uploadTask.ref);
        return { url, name: file.name };
      })
    );

    const response = await axios.put(
      `https://womanup-9b548-default-rtdb.firebaseio.com/todo/${todo[0]}.json`,
      {
        ...redactTodo,
        attachedFiles: [...redactTodo.attachedFiles, ...updateLoadFiles],
      }
    );
    getTodos();
    setShowModal(false);
    modalFileRef.current.value = null;
  };

  const deleteFile = (url) => {
    setRedactTodo({
      ...redactTodo,
      attachedFiles: redactTodo.attachedFiles.filter(
        (file) => file.url !== url
      ),
    });
  };

  return (
    <div
      className={showModal ? "modal_active" : "modal"}
      onClick={() => {
        setShowModal(false);
      }}
    >
      <form
        className="modal_content"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <input
          className="modal_input"
          placeholder="??????????????????"
          value={redactTodo.title}
          onChange={(e) =>
            setRedactTodo({ ...redactTodo, title: e.target.value })
          }
        />
        <input
          className="modal_input"
          placeholder="????????????????"
          value={redactTodo.body}
          onChange={(e) =>
            setRedactTodo({ ...redactTodo, body: e.target.value })
          }
        />
        <input
          className="modal_input"
          type="date"
          value={redactTodo.completeDate}
          onChange={(e) =>
            setRedactTodo({ ...redactTodo, completeDate: e.target.value })
          }
        />
        {redactTodo.attachedFiles?.map((file) => (
          <div key={file.url} className="modal_file_container">
            <a href={file.url} download target="_blank">
              {file.name}{" "}
            </a>
            <button onClick={() => deleteFile(file.url)}>?????????????? ????????</button>
          </div>
        ))}

        <input
          className="modal_input_file"
          type="file"
          multiple="multiple"
          ref={modalFileRef}
          onChange={(e) => {
            setRedactTodo({ ...redactTodo, newAttachedFiles: e.target.files });
          }}
        />
        <button className="modal_button" type="button" onClick={updateTodo}>
          ??????????????????
        </button>
      </form>
    </div>
  );
};

export default RedactTodoModal;
