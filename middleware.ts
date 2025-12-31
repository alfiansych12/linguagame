import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/game/:path*",
        "/profile/:path*",
        "/shop/:path*",
        // Tambahkan route lain yang butuh login di sini
    ],
};
