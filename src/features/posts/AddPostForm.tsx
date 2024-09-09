import React, { useState } from "react"
import { useAppSelector } from "../../app/hooks"
import { selectAllUsers } from "../users/usersSlice"
import { useNavigate } from "react-router-dom"
import { useAddNewPostMutation } from "./postsSlice"

const AddPostForm = () => {
  const [addNewPost, {isLoading}] = useAddNewPostMutation();
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState('');

  const users = useAppSelector(selectAllUsers);
  const navigate = useNavigate();
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value);
  const onAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => setUserId(e.target.value);

  const canSave = [title, content, userId].every(Boolean) && !isLoading;

  const onSavePostClicked = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (canSave) {
      try {
        await addNewPost({title, body: content, userId}).unwrap();
        setTitle('');
        setContent('');
        setUserId('');
        navigate('/')
      } catch (err) {
        console.error('Failed to save the post', err);
      }
    }
  }

  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))

  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input type="text" id="postTitle" name="postTitle" value={title} onChange={onTitleChange} />
        <label htmlFor="postAuthor">Author:</label>
        <select id="postAuthor" value={userId} onChange={onAuthorChange}>
          <option value=""></option>
          {usersOptions}
        </select>
        <label htmlFor="postContent">Content:</label>
        <textarea id="postContent" name="postContent" value={content} onChange={onContentChange} />
        <button onClick={onSavePostClicked} disabled={!canSave}>Save Post</button>
      </form>
    </section>
  )
}

export default AddPostForm