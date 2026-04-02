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
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber?: string
    role: 'customer' | 'seller'
    shopTokPay: number
    coins: number
    vouchers: number
    orderStats: OrderStats
    addresses: Address[]
    cards: CreditCard[]
    bankAccounts: BankAccount[]
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
    id: string
    name: string
    phone: string
    postalCode: string
    province: string
    city: string
    district: string
    fullAddress: string
    isDefault: boolean
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

export type AsyncDataState = 'idle' | 'loading' | 'fulfilled' | 'error'