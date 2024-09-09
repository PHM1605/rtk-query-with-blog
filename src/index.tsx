import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import { extendedApiSlice } from './features/posts/postsSlice';

store.dispatch(extendedApiSlice.endpoints.getPosts.initiate('Post'))

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
    
);
