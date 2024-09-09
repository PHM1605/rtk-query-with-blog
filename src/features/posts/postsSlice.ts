import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { sub } from "date-fns";
import { RootState } from "../../app/store";

export interface IPost {
  id: string 
  title: string 
  body: string 
  userId: string 
  date: string 
  reactions: {
    [reaction:string]: number
  }
}

// Normalization: posts: { ids: [1,2,3], entities: {'1': {userId:1, id:1, title...}, '2': {}, ...}}
const postsAdapter = createEntityAdapter<IPost>({
  sortComparer: (a, b) => b.date.localeCompare(a.date)
})

const initialState = postsAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPosts: builder.query({
      query: () => '/posts',
      transformResponse: (responseData: IPost[]) => {
        let min = 1;
        const loadedPosts = responseData.map(post => {
          if (!post?.date) post.date = sub(new Date(), {minutes:min++}).toISOString();
          if (!post?.reactions) post.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
          return post;
        });
        return postsAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => result 
      ?[
        {type: 'Post', id: "LIST"},
        // provide an Object for each individual Post
        // if one id is invalidated => re-fetch our list
        ...result.ids.map(id => ({type: 'Post' as const, id}))
      ] : 
      [{type: 'Post', id: "LIST"}]
    }),
    getPostsByUserId: builder.query({
      query: id=> `/posts/?userId=${id}`,
      transformResponse: (responseData: IPost[]) => {
        let min=1;
        const loadedPosts = responseData.map(post => {
          if (!post?.date) {
            post.date = sub(new Date(), {minutes: min++}).toISOString();
          }
          if (!post?.reactions) post.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
          return post;
        })
        return postsAdapter.setAll(initialState, loadedPosts);
      },
      
      providesTags: (result, error, arg) => {
        return result ? [
          ...result.ids.map(id => ({id, type: 'Post' as const}))
        ] : []
      }
    }),
    addNewPost: builder.mutation({
      query: (initialPost: {title: string, body: string, userId: string}) => ({
        url: '/posts',
        method: 'POST',
        body: {
          ...initialPost,
          userId: String(initialPost.userId),
          date: new Date().toISOString(),
          reactions: {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
        }
      }),
      invalidatesTags: [
        { type: 'Post', id: 'LIST' }
      ]
    }),
    updatePost: builder.mutation({
      query: (initialPost: {id:string, title:string, body:string, userId:string}) => ({
        url: `/posts/${initialPost.id}`,
        method: 'PUT',
        body: {...initialPost, date: new Date().toISOString()}
      }),
      // arg: is the 'initialPost' value in the query
      invalidatesTags: (result, error, arg) => [
        {type: 'Post', id: arg.id}
      ]
    }),
    deletePost: builder.mutation({
      query: ({id}:{id:string}) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
        body: {id}
      }),
      invalidatesTags: (resule, error, arg) => [
        { type: 'Post' as const, id: arg.id}
      ]
    }),
    addReaction: builder.mutation({
      query: ({ postId, reactions }: {postId:string, reactions:{[reaction:string]: number}}) => ({
        url: `posts/${postId}`,
        method: 'PATCH',
        // In a real app, we'd need to base this on userId so that a user can't "like" a post more than once
        body: {reactions}
      }),
      // first object: same as above; second object: method we can use and a promise
      // purpose: instantly update the "post" reaction count to +1 to give nicer UI; if not success then we "undo" it
      // notice: no "invalidatesTags" as we don't want to refetch the Reaction List again; but directly update the State (database will still be updated though)
      async onQueryStarted({postId, reactions}, {dispatch, queryFulfilled}) {
        const patchResult = dispatch(
          // 1st argument: endpoint; 2nd argument: cache key
          extendedApiSlice.util.updateQueryData('getPosts', undefined, draft => {
            const post = draft.entities[postId]
            if (post) post.reactions = reactions
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo();
        }
      }
    })
  })
})

export const {
  useGetPostsQuery,
  useGetPostsByUserIdQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddReactionMutation
} = extendedApiSlice;
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select('Post') 
const selectPostsData = createSelector(
  selectPostsResult,
  postsResult => postsResult.data // normalized state object with ids & entities
)

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
} = postsAdapter.getSelectors<RootState>(state => selectPostsData(state) ?? initialState) // if postsData is null => take initialState