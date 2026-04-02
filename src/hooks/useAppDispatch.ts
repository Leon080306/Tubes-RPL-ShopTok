import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../redux/store' // nyambung sama store.ts tadi

// bikin custom dari useDispatch
// .withTypes<AppDispatch>() tuh buat ngasitau typescript kalo kita mau pake pengirim ini tapi datanya harus sesuai aturan AppDispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
