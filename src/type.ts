export type BasicMenuProps = {
    label: string;
    menuItems: Category[];
    className?: string;
    onSelect?: (value: string) => void;
}

export type Category = {
    category_id: string;
    name: string;
    icon: string;
    parent_id?: string | null;
    totalProducts?: number;
}

export type Shop = {
    shop_id: string
    name: string
}

export type Product = {
    product_id: string
    shop_id: string
    category_id: string
    name: string
    description: string
    view_count: number
    ratings?: Rating[]
    variants?: ProductVariant[]
    category?: Category
    shop?: ShopInfo
}

export type ProductVariant = {
    variant_id: string
    product_id: string
    name: string
    picture: string
    stock: number
    price: number
    orderItems?: OrderItems[]
}

export type OrderItems = {
    order_id: string
    variant_id: string
    quantity: number
}

export type Rating = {
    user_id: string
    rating_id: string
    product_id: string
    value: number
    title: string
    description: string
    picture?: string
    createdAt: string
    user?: {
        first_name: string
        last_name: string
    }
}

export type UserInfo = {
    user_id: string
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
// Internal form state (UI-facing)
export type AddressFormState = {
    id: string;
    name: string;        // address label/nickname
    receiver: string;    // maps to full_name
    phone: string;       // maps to phone_number
    province: string;
    city: string;
    district: string;    // maps to sub_district
    postalCode: string;
    fullAddress: string; // maps to address
    isDefault: boolean;
};

// API/DB shape
export type Address = {
    address_id?: string;
    user_id?: string;
    full_name: string;
    address: string;
    province: string;
    city: string;
    sub_district: string;
    phone_number: string;
    is_default: boolean;
};

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
    chat_id: string;       // UUID
    sender_role: string;
    message: string;
    created_at: string;
};

export type ChatSession = {
    shop_id: string;       // UUID
    shop_name: string;
    last_message: string;
    unread_count: number;
    messages: ChatMessage[];
};

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
    products?: Product // ntr diganti pake type  Product. blom ada soalnya
    createdAt?: string
    updatedAt?: string
}

export type CartItem = {
    user_id: string;
    variant_id: string;
    quantity: number;
    is_selected: boolean;
    variant: {
        variant_id: string;
        name: string;
        price: string; 
        picture: string;
        product: {
            name: string;
            shop: {
                name: string;
            }
        }
    }
}

export type OrderItem = {
    order_id: string;
    variant_id: string;
    quantity: number;
}

export type Order = {
    order_id: string;
    customer_id: string;
    shop_id: string;
    address_id: string;
    status: "pending" | "completed" | "cancelled";
    amount_paid: number;
    orderItems?: OrderItem[];
    createdAt?: string;
    updatedAt?: string;
}

export type OrderDetail = {
    order_id: string
    customer_id: string
    shop_id: string
    address_id: string
    status: "pending" | "completed" | "cancelled"
    amount_paid: number
    createdAt: string
    updatedAt: string
    address: Address
    shop: {                  
        shop_id: string
        name: string
        profile_pic?: string
    }
    orderItems: {
        order_id: string
        variant_id: string
        quantity: number
        variant: {
            variant_id: string
            name: string
            price: string
            picture: string
            product: {
                name: string
            }
        }
    }[]
}

export type AsyncDataState = 'idle' | 'loading' | 'fulfilled' | 'error'