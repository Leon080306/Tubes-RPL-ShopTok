export type BasicMenuProps = {
    label: string;
    menuItems: Category[];
    className?: string;
    onSelect?: (value: string) => void;
}

export type Category = {
    name: string;
}

export type UserInfo = {
    first_name: string
    last_name: string
    email: string
    password: string
    phone_number?: string
    profile_pic?: string
    role: 'admin' | 'customer' | 'seller'
    status: 'active' | 'suspended'

    shopTok_Pay: number
    coins: number
    vouchers: number

    orderStats: OrderStats
    addresses: Address[]
    cards: CreditCard[]
    bankAccounts: BankAccount[]
    chats?: ChatSession[]
    shop_info?: ShopInfo
}

// ini buat yg di profile page bisa tracking orderan kitaa
export type OrderStats = {
    unpaid: number
    processing: number
    shipped: number
    toReview: number
}

// ni buat setting addressnya
export type Address = {
    address_id: number
    user_id: number
    full_name: string
    address: string
    province: string
    city: string
    subdistrict: string
    is_default: boolean
}

export type CreditCard = {
    id: string
    cardNumber: string
    expiryDate: string
    cvv: string
    cardHolderName: string
}

export type BankAccount = {
    id: string
    bankName: string
    accountNumber: string
    accountHolderName: string
}

export type AuthState = {
    userInfo?: UserInfo
    isLoading: boolean
}

export type ChatMessage = {
    chat_id: number
    sender_role: 'customer' | 'seller'
    message: string
    created_at: string 
}

export type ChatSession = {
    shop_id: number
    shop_name: string
    shop_logo?: string
    last_message: string
    unread_count: number
    messages: ChatMessage[]
}

export type ShopInfo = {
    shop_id: string      
    owner_id: string
    name: string
    description?: string 
    profile_pic?: string
    banner?: string
    is_approved: boolean
    status: "active" | "suspended"
    
    owner?: UserInfo 
    products?: any[] // ntr diganti pake type  Product. blom ada soalnya
    createdAt?: string
    updatedAt?: string
}

export type AsyncDataState = 'idle' | 'loading' | 'fulfilled' | 'error'