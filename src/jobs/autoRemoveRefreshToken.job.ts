import prisma from "@/database";
import { Cron } from "croner";

const autoRemoveRefreshTokenJob = async () => {
    new Cron('@hourly', async () => {
        try {
            await prisma.refreshToken.deleteMany({
                where: {
                    expiresAt: {
                        lte: new Date()
                    }
                }
            });
            console.log("Refresh tokens removed successfully.");
        }
        catch (error) {
            console.error("Error removing refresh tokens:", error);
        }
    })
}

export default autoRemoveRefreshTokenJob;