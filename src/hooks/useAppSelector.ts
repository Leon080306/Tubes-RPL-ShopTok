import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store' // ngambil tipe data dari semua isi store kita

// bikin custom useSelector
// .withTypes<RootState>() ngasitau type script kalo waktu kita mau ngambil data harus liat route RootState, biar kita tau folder apa aja yg ada di dalem store
export const useAppSelector = useSelector.withTypes<RootState>()
