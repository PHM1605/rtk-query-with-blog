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
    })
  })
})

export const {useGetPostsQuery} = extendedApiSlice;
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select('Post') // OR "LIST ?!?
const selectPostsData = createSelector(
  selectPostsResult,
  postsResult => postsResult.data // normalized state object with ids & entities
)

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
} = postsAdapter.getSelectors<RootState>(state => selectPostsData(state) ?? initialState) // if postsData is null => take initialState