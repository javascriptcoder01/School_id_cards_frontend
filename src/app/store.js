import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer.js';
import rootSaga from './rootSaga.js';

export const configureAppStore = (preloadedState = {}) => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
      }).concat(sagaMiddleware),
  });

  store.sagaTask = sagaMiddleware.run(rootSaga);
  store.sagaMiddleware = sagaMiddleware;

  return store;
};

export const store = configureAppStore();

export default store;

