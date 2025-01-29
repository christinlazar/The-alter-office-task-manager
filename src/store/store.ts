import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from './slice/AuthSlice'

const store = configureStore({
    reducer:{
        auth: AuthSlice
    }
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = ReturnType<typeof store.dispatch>
export default store