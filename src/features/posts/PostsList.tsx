import { useAppSelector } from "../../app/hooks";
import PostsExcerpt from "./PostsExcerpt";
import { selectPostIds } from "./postsSlice";

import { useGetPostsQuery } from "./postsSlice";

const PostsList = () => {
  const {isLoading, isSuccess, isError, error} = useGetPostsQuery('Post');
  const orderedPostIds = useAppSelector(selectPostIds);
  let content;
  if (isLoading) {
    content = <p>Loading...</p>
  } else if (isSuccess) {
    content = orderedPostIds.map(postId =><PostsExcerpt key={postId} postId={postId}/>);
  } else if (isError) {
    content = <p>{JSON.stringify(error)}</p>
  }
  return (
    <section>
      {content}
    </section>
  )
}

export default PostsList