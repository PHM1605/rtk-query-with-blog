import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks';
import { selectPostById } from './postsSlice';
import PostAuthor from './PostAuthor';
import TimeAgo from './TimeAgo';
import ReactionButtons from './ReactionButtons';

const SinglePostPage = () => {
  const {postId} = useParams();
  const post = useAppSelector((state) => selectPostById(state, postId??""));
  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <p className='postCredit'>
        <Link to={`/post/edit/${post.id}`}>Edit Post</Link>
        <PostAuthor userId={post.userId} />
        <TimeAgo timeStamp={post.date} />
      </p>
      <ReactionButtons post={post}/>
    </article>
  )
}

export default SinglePostPage