// src/utils/startChat.ts
export async function startChat(
    user_id: string,
    shop_id: string,
    message: string = "Halo, saya ingin bertanya tentang produk Anda."
): Promise<boolean> {
    try {
        const res = await fetch("/api/chats", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id,
                shop_id,
                message,
                sender_role: "customer",
            }),
        });

        return res.ok;
    } catch (error) {
        console.error("Failed to start chat:", error);
        return false;
    }
}