import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './components/Theme/slice'

export default configureStore({
  reducer: {
    theme: themeReducer,
  },
})
