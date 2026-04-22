import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../redux/store' // nyambung sama store.ts tadi

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
