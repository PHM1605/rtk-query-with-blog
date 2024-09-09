import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import { extendedApiSlice } from './features/posts/postsSlice';
import { BrowserRouter } from 'react-router-dom';
import { usersApiSlice } from './features/users/usersSlice';

store.dispatch(extendedApiSlice.endpoints.getPosts.initiate('Post'))
store.dispatch(usersApiSlice.endpoints.getUsers.initiate('User'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    
  </Provider>
    
);
