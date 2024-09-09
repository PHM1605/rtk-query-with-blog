import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { RootState } from "../../app/store";

interface IUser {
  id: string 
  name: string 
  username: string 
  email: string 
  address: {
    street: string 
    suite: string 
    city: string
    zipcode: string 
    geo: {
      lat: string 
      lng: string 
    }
  },
  phone: string
  website: string 
  company: {
    name: string 
    catchPhrase: string 
    bs: string
  }
}

const usersAdapter = createEntityAdapter<IUser>();
const initialState = usersAdapter.getInitialState();

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query({
      query: () => '/users',
      transformResponse: (responseData: IUser[]) => {
        return usersAdapter.setAll(initialState, responseData);
      },
      providesTags: (result, error, arg) => 
        result ?
        [
        {type: 'User', id: 'LIST'},
        ...result.ids.map(id =>({type: 'User' as const, id}))
        ]:
        [
          {type: 'User', id: 'LIST'}
        ]
    })
  })
})

export const {
  useGetUsersQuery
} = usersApiSlice;

export const selectUsersResult = usersApiSlice.endpoints.getUsers.select("User")

const selectUsersData = createSelector(
  selectUsersResult,
  usersResult => usersResult.data // normailzed state object with ids & entities
)

export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds
} = usersAdapter.getSelectors<RootState>(state => selectUsersData(state) ?? initialState);