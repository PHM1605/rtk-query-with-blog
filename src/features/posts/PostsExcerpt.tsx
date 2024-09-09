import PostAuthor from "./PostAuthor";
import TimeAgo from "./TimeAgo";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectPostById } from "./postsSlice";

const PostsExcerpt = ({postId}: {postId: string}) => {
  const post = useAppSelector(state => selectPostById(state, postId))
  return (
    <article>
      <h2>{post.title}</h2>
      <p className="excerpt">{post.body.substring(0,75)}...</p>
      <p className="postCredit">
        <Link to={`post/${post.id}`}>View Post</Link>
        <PostAuthor userId={post.userId}/>
        <TimeAgo timeStamp={post.date}/>
      </p>
      
    </article>
  )
}

export default PostsExcerpt