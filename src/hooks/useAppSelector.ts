import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store' // ngambil tipe data dari semua isi store kita

export const useAppSelector = useSelector.withTypes<RootState>()
